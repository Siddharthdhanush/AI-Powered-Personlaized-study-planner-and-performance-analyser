from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import os
from sqlalchemy.orm import Session
from typing import List

from backend.core import database
from backend.user import auth
from backend.user.models import Student
from . import models, schemas

router = APIRouter()

# --- Subject Routes ---
@router.post("/subjects", response_model=schemas.SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject: schemas.SubjectCreate,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    new_subject = models.Subject(
        subject_name=subject.subject_name,
        student_id=current_user.student_id
    )
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return new_subject

@router.get("/subjects", response_model=List[schemas.SubjectOut])
def get_subjects(
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subjects = db.query(models.Subject).filter(models.Subject.student_id == current_user.student_id).all()
    return subjects

@router.delete("/subjects/{subject_id}")
def delete_subject(
    subject_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject = db.query(models.Subject).filter(models.Subject.subject_id == subject_id, models.Subject.student_id == current_user.student_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"message": "Subject deleted"}

@router.post("/subjects/{subject_id}/upload", status_code=status.HTTP_200_OK)
def upload_syllabus_file(
    subject_id: int,
    file: UploadFile = File(...),
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Verify subject belongs to user
    subject_record = db.query(models.Subject).filter(
        models.Subject.subject_id == subject_id,
        models.Subject.student_id == current_user.student_id
    ).first()
    
    if not subject_record:
        raise HTTPException(status_code=404, detail="Subject not found")

    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    file_location = f"{upload_dir}/{subject_id}_{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())

    subject_record.file_path = file_location
    db.commit()

    return {"info": f"file '{file.filename}' saved at '{file_location}'"}

# --- Topic Routes ---
@router.post("/subjects/{subject_id}/topics", response_model=schemas.TopicOut, status_code=status.HTTP_201_CREATED)
def create_topic(
    subject_id: int,
    topic: schemas.TopicCreate,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Verify subject belongs to user
    subject_record = db.query(models.Subject).filter(
        models.Subject.subject_id == subject_id,
        models.Subject.student_id == current_user.student_id
    ).first()
    
    if not subject_record:
        raise HTTPException(status_code=404, detail="Subject not found")

    new_topic = models.Topic(
        subject_id=subject_id,
        topic_name=topic.topic_name,
        difficulty_weight=topic.difficulty_weight,
        estimated_hours=topic.estimated_hours
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic

@router.get("/subjects/{subject_id}/topics", response_model=List[schemas.TopicOut])
def get_topics(
    subject_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Verify subject belongs to user
    subject_record = db.query(models.Subject).filter(
        models.Subject.subject_id == subject_id,
        models.Subject.student_id == current_user.student_id
    ).first()
    
    if not subject_record:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    return subject_record.topics

@router.delete("/subjects/{subject_id}/topics/{topic_id}")
def delete_topic(
    subject_id: int,
    topic_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject = db.query(models.Subject).filter(models.Subject.subject_id == subject_id, models.Subject.student_id == current_user.student_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    topic = db.query(models.Topic).filter(models.Topic.topic_id == topic_id, models.Topic.subject_id == subject_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
    return {"message": "Topic deleted"}

# --- Exam Routes ---
@router.post("/subjects/{subject_id}/exams", response_model=schemas.ExamOut, status_code=status.HTTP_201_CREATED)
def create_exam(
    subject_id: int,
    exam: schemas.ExamCreate,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Verify subject belongs to user
    subject_record = db.query(models.Subject).filter(
        models.Subject.subject_id == subject_id,
        models.Subject.student_id == current_user.student_id
    ).first()
    
    if not subject_record:
        raise HTTPException(status_code=404, detail="Subject not found")

    new_exam = models.Exam(
        subject_id=subject_id,
        exam_date=exam.exam_date
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)
    return new_exam

@router.put("/subjects/{subject_id}/exams/{exam_id}", response_model=schemas.ExamOut)
def update_exam(
    subject_id: int,
    exam_id: int,
    exam: schemas.ExamCreate,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject_record = db.query(models.Subject).filter(
        models.Subject.subject_id == subject_id,
        models.Subject.student_id == current_user.student_id
    ).first()
    
    if not subject_record:
        raise HTTPException(status_code=404, detail="Subject not found")

    exam_record = db.query(models.Exam).filter(
        models.Exam.exam_id == exam_id,
        models.Exam.subject_id == subject_id
    ).first()

    if not exam_record:
        raise HTTPException(status_code=404, detail="Exam not found")

    exam_record.exam_date = exam.exam_date
    db.commit()
    db.refresh(exam_record)
    return exam_record

@router.get("/exams", response_model=List[schemas.ExamOut])
def get_all_exams(
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Get exams for all subjects owned by the student
    exams = db.query(models.Exam).join(models.Subject).filter(
        models.Subject.student_id == current_user.student_id
    ).all()
    return exams
