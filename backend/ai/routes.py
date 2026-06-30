from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.core import database
from backend.user import auth
from backend.user.models import Student
from backend.syllabus.models import Subject, Topic
from . import schemas, utils, models

router = APIRouter()

@router.post("/quiz/generate/{topic_id}", response_model=schemas.QuizGenerationResponse)
def generate_quiz(
    topic_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    try:
        raw_questions = utils.generate_quiz_for_topic(topic.topic_name, num_questions=3)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    saved_questions = []
    for q_data in raw_questions:
        q = models.Question(
            topic_id=topic.topic_id,
            question_text=q_data.get("question_text", "Missing Question"),
            option_a=q_data.get("option_a", ""),
            option_b=q_data.get("option_b", ""),
            option_c=q_data.get("option_c", ""),
            option_d=q_data.get("option_d", ""),
            correct_option=q_data.get("correct_option", "A"),
            explanation=q_data.get("explanation", ""),
            difficulty=q_data.get("difficulty", "Medium"),
            generated_by="ollama"
        )
        db.add(q)
        saved_questions.append(q)
    
    db.commit()
    for q in saved_questions:
        db.refresh(q)

    return {"message": "Quiz generated successfully", "questions": saved_questions}

@router.post("/syllabus/extract/{subject_id}", response_model=schemas.ExtractionResponse)
def extract_syllabus(
    subject_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject = db.query(Subject).filter(
        Subject.subject_id == subject_id,
        Subject.student_id == current_user.student_id
    ).first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    if not subject.file_path:
        raise HTTPException(status_code=400, detail="No syllabus file uploaded for this subject")

    try:
        extracted = utils.extract_topics_from_pdf(subject.file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    added_topics = []
    for t_data in extracted:
        t = Topic(
            subject_id=subject.subject_id,
            topic_name=t_data.get("topic_name", "Unknown"),
            difficulty_weight=float(t_data.get("difficulty_weight", 2.0)),
            estimated_hours=float(t_data.get("estimated_hours", 2.0))
        )
        db.add(t)
        added_topics.append(t)
        
    db.commit()
    
    return {
        "message": "Topics extracted and added to syllabus",
        "topics_added": len(added_topics),
        "topics": added_topics
    }

@router.post("/assessment/submit", response_model=schemas.AssessmentOut)
def submit_assessment(
    data: schemas.AssessmentSubmit,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. Create Assessment
    assessment = models.Assessment(
        student_id=current_user.student_id,
        topic_id=data.topic_id
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # 2. Add Answers & calculate score
    correct_count = 0
    for ans_data in data.answers:
        q = db.query(models.Question).filter(models.Question.question_id == ans_data.question_id).first()
        is_correct = False
        if q and not ans_data.is_skipped and ans_data.selected_option == q.correct_option:
            is_correct = True
            correct_count += 1
            
        ans = models.AssessmentAnswer(
            assessment_id=assessment.assessment_id,
            question_id=ans_data.question_id,
            selected_option=ans_data.selected_option,
            is_correct=is_correct,
            response_time=ans_data.response_time,
            is_skipped=ans_data.is_skipped
        )
        db.add(ans)
        
    # Finalize score (percentage)
    total_q = len(data.answers)
    assessment.score = (correct_count / total_q * 100) if total_q > 0 else 0
    db.commit()
    db.refresh(assessment)
    
    return assessment
