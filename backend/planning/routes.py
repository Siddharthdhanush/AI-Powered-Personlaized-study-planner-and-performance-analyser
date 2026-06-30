from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.core import database
from backend.user import auth
from backend.user.models import Student
from . import schemas, utils, models
from backend.syllabus.models import Topic

router = APIRouter()

@router.post("/generate/{subject_id}", status_code=status.HTTP_200_OK)
def trigger_generate_timetable(
    subject_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Generates a daily study timetable for the given subject based on user preferences, topics, and exam date.
    """
    result = utils.generate_timetable(db, student_id=current_user.student_id, subject_id=subject_id)
    return result

@router.get("/timetable", response_model=List[schemas.StudyPlanOut])
def get_timetable(
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Fetch the generated study plans for the user.
    """
    plans = db.query(models.StudyPlan).filter(models.StudyPlan.student_id == current_user.student_id).order_by(models.StudyPlan.planned_date).all()
    return plans

@router.put("/sessions/{plan_id}/complete")
def complete_study_session(
    plan_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Mark a specific study plan session as complete.
    """
    plan = db.query(models.StudyPlan).filter(
        models.StudyPlan.plan_id == plan_id,
        models.StudyPlan.student_id == current_user.student_id
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Study plan session not found")

    plan.is_completed = True
    db.commit()

@router.put("/sessions/{plan_id}", response_model=schemas.StudyPlanOut)
def update_study_session(
    plan_id: int,
    session_data: schemas.StudyPlanUpdate,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    plan = db.query(models.StudyPlan).filter(
        models.StudyPlan.plan_id == plan_id,
        models.StudyPlan.student_id == current_user.student_id
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Study plan session not found")

    plan.planned_date = session_data.planned_date
    plan.planned_minutes = session_data.planned_minutes
    plan.start_time = session_data.start_time
    plan.end_time = session_data.end_time
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/sessions/{plan_id}")
def delete_session(plan_id: int, current_user: Student = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    plan = db.query(models.StudyPlan).filter(models.StudyPlan.plan_id == plan_id, models.StudyPlan.student_id == current_user.student_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    db.delete(plan)
    db.commit()
    return {"message": "Session deleted"}

@router.delete("/sessions")
def clear_all_sessions(current_user: Student = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db.query(models.StudyPlan).filter(models.StudyPlan.student_id == current_user.student_id).delete(synchronize_session=False)
    db.commit()
    return {"message": "All sessions cleared"}
