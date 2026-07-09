from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import random

from backend.core import database
from backend.user import auth
from backend.user.models import Student
from . import schemas, models, pipeline

router = APIRouter()

from backend.ai.models import Assessment, AssessmentAnswer

@router.get("/analytics", response_model=schemas.PredictionResponse)
def get_predictive_analytics(
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Fetches the latest predictive analytics for the user.
    Uses actual quiz submissions to predict mastery and readiness.
    Fals back to baseline simulation if no quiz data exists.
    """
    # 1. Fetch the most recent 30 assessment answers for the student to reflect their current readiness
    all_answers = db.query(AssessmentAnswer).join(Assessment).filter(
        Assessment.student_id == current_user.student_id
    ).order_by(Assessment.attempt_date.desc()).limit(30).all()
    
    pred_obj = None
    if all_answers:
        # Calculate real metrics
        total_q = len(all_answers)
        correct_q = sum(1 for a in all_answers if a.is_correct)
        mcq_acc = round((correct_q / total_q) * 100.0, 2)
        
        times = [a.response_time for a in all_answers if a.response_time is not None]
        avg_time = round(sum(times) / len(times), 2) if times else 0.0
        
        skips = sum(1 for a in all_answers if a.is_skipped)
        
        # Check if we already have a prediction with identical stats to avoid duplicate history inserts
        latest_pred = db.query(models.MLPrediction).filter(
            models.MLPrediction.student_id == current_user.student_id
        ).order_by(models.MLPrediction.timestamp.desc()).first()
        
        if latest_pred and latest_pred.mcq_accuracy == mcq_acc and latest_pred.avg_response_time == avg_time and latest_pred.skip_count == skips:
            pred_obj = latest_pred
        else:
            # Predict using trained models
            preds = pipeline.predict_performance(mcq_acc, avg_time, skips)
            
            # Save to database for history
            new_pred = models.MLPrediction(
                student_id=current_user.student_id,
                mcq_accuracy=mcq_acc,
                avg_response_time=avg_time,
                skip_count=skips,
                topic_mastery=preds["topic_mastery"],
                exam_readiness_prob=preds["exam_readiness_prob"]
            )
            db.add(new_pred)
            db.commit()
            db.refresh(new_pred)
            pred_obj = new_pred
    else:
        # Fallback simulation if they haven't taken any quizzes yet
        latest_pred = db.query(models.MLPrediction).filter(
            models.MLPrediction.student_id == current_user.student_id
        ).order_by(models.MLPrediction.timestamp.desc()).first()
        
        if not latest_pred:
            mcq_acc = round(random.uniform(40.0, 75.0), 2)
            avg_time = round(random.uniform(30.0, 90.0), 2)
            skips = random.randint(0, 4)
            
            preds = pipeline.predict_performance(mcq_acc, avg_time, skips)
            
            new_pred = models.MLPrediction(
                student_id=current_user.student_id,
                mcq_accuracy=mcq_acc,
                avg_response_time=avg_time,
                skip_count=skips,
                topic_mastery=preds["topic_mastery"],
                exam_readiness_prob=preds["exam_readiness_prob"]
            )
            db.add(new_pred)
            db.commit()
            db.refresh(new_pred)
            pred_obj = new_pred
        else:
            pred_obj = latest_pred

    # Calculate weak topics (latest score < 60%)
    latest_scores = {}
    for a in db.query(Assessment).filter(Assessment.student_id == current_user.student_id).all():
        if a.topic_id not in latest_scores or a.attempt_date > latest_scores[a.topic_id]["date"]:
            latest_scores[a.topic_id] = {"score": a.score, "date": a.attempt_date}
            
    weak_topic_names = []
    from backend.syllabus.models import Topic as SyllabusTopic
    for topic_id, data in latest_scores.items():
        if data["score"] < 60.0:
            topic = db.query(SyllabusTopic).filter(SyllabusTopic.topic_id == topic_id).first()
            if topic:
                weak_topic_names.append(topic.topic_name)

    try:
        from backend.core.exporter import export_db_to_csv
        export_db_to_csv(db)
    except Exception as e:
        print(f"Error exporting data inside analytics endpoint: {e}")

    return {
        "topic_mastery": pred_obj.topic_mastery,
        "exam_readiness_prob": pred_obj.exam_readiness_prob,
        "mcq_accuracy": pred_obj.mcq_accuracy,
        "avg_response_time": pred_obj.avg_response_time,
        "skip_count": pred_obj.skip_count,
        "timestamp": pred_obj.timestamp,
        "weak_topics": weak_topic_names
    }

@router.post("/trigger-update")
def force_recalculate_predictions(
    # This would be called after a user finishes a quiz
    mcq_accuracy: float,
    avg_response_time: float,
    skip_count: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    preds = pipeline.predict_performance(mcq_accuracy, avg_response_time, skip_count)
    
    new_pred = models.MLPrediction(
        student_id=current_user.student_id,
        mcq_accuracy=mcq_accuracy,
        avg_response_time=avg_response_time,
        skip_count=skip_count,
        topic_mastery=preds["topic_mastery"],
        exam_readiness_prob=preds["exam_readiness_prob"]
    )
    db.add(new_pred)
    db.commit()
    
    return {"message": "Predictions updated"}

@router.get("/history", response_model=List[schemas.MLPredictionOut])
def get_prediction_history(
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    history = db.query(models.MLPrediction).filter(
        models.MLPrediction.student_id == current_user.student_id
    ).order_by(models.MLPrediction.timestamp.asc()).all()
    return history
