from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import os
from sqlalchemy.orm import Session
from typing import List

from backend.core import database
from backend.user import auth
from backend.user.models import Student
from . import models, schemas
from backend.ai import document_parser
from backend.ai.utils import get_semantic_context

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

@router.put("/subjects/{subject_id}", response_model=schemas.SubjectOut)
def update_subject(
    subject_id: int,
    subject: schemas.SubjectCreate,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject_record = db.query(models.Subject).filter(
        models.Subject.subject_id == subject_id,
        models.Subject.student_id == current_user.student_id
    ).first()
    
    if not subject_record:
        raise HTTPException(status_code=404, detail="Subject not found")

    subject_record.subject_name = subject.subject_name
    db.commit()
    db.refresh(subject_record)
    return subject_record

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

@router.post("/subjects/{subject_id}/resources", status_code=status.HTTP_201_CREATED, response_model=schemas.SubjectResourceOut)
def upload_subject_resource(
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

    file_location = f"{upload_dir}/{subject_id}_resource_{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())

    new_resource = models.SubjectResource(
        subject_id=subject_id,
        filename=file.filename,
        file_path=file_location
    )
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)

    # Rebuild semantic context for all topics under this subject
    raw_text = ""
    if subject_record.file_path and os.path.exists(subject_record.file_path):
        try:
            with open(subject_record.file_path, "rb") as f:
                file_bytes = f.read()
            filename = os.path.basename(subject_record.file_path)
            raw_text += document_parser.parse_document(file_bytes, filename) + "\n\n"
        except Exception as e:
            print(f"Error parsing syllabus: {e}")
            
    for res in subject_record.resources:
        if res.file_path and os.path.exists(res.file_path):
            try:
                with open(res.file_path, "rb") as f:
                    file_bytes = f.read()
                filename = os.path.basename(res.file_path)
                raw_text += document_parser.parse_document(file_bytes, filename) + "\n\n"
            except Exception as e:
                print(f"Error parsing resource: {e}")

    if raw_text.strip():
        for topic in subject_record.topics:
            topic.content_text = get_semantic_context(raw_text, topic.topic_name)
        db.commit()

    return new_resource

@router.delete("/subjects/{subject_id}/resources/{resource_id}")
def delete_subject_resource(
    subject_id: int,
    resource_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject_record = db.query(models.Subject).filter(
        models.Subject.subject_id == subject_id,
        models.Subject.student_id == current_user.student_id
    ).first()
    
    if not subject_record:
        raise HTTPException(status_code=404, detail="Subject not found")

    resource = db.query(models.SubjectResource).filter(
        models.SubjectResource.resource_id == resource_id,
        models.SubjectResource.subject_id == subject_id
    ).first()

    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    if os.path.exists(resource.file_path):
        try:
            os.remove(resource.file_path)
        except Exception as e:
            print(f"Error removing file: {e}")

    db.delete(resource)
    db.commit()

    # Rebuild contexts
    raw_text = ""
    if subject_record.file_path and os.path.exists(subject_record.file_path):
        try:
            with open(subject_record.file_path, "rb") as f:
                file_bytes = f.read()
            filename = os.path.basename(subject_record.file_path)
            raw_text += document_parser.parse_document(file_bytes, filename) + "\n\n"
        except Exception as e:
            print(f"Error parsing syllabus: {e}")
            
    for res in subject_record.resources:
        if res.file_path and os.path.exists(res.file_path):
            try:
                with open(res.file_path, "rb") as f:
                    file_bytes = f.read()
                filename = os.path.basename(res.file_path)
                raw_text += document_parser.parse_document(file_bytes, filename) + "\n\n"
            except Exception as e:
                print(f"Error parsing resource: {e}")

    for topic in subject_record.topics:
        if raw_text.strip():
            topic.content_text = get_semantic_context(raw_text, topic.topic_name)
        else:
            topic.content_text = ""
    db.commit()

    return {"message": "Resource deleted successfully"}

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

    raw_text = ""
    if subject_record.file_path and os.path.exists(subject_record.file_path):
        try:
            with open(subject_record.file_path, "rb") as f:
                file_bytes = f.read()
            filename = os.path.basename(subject_record.file_path)
            raw_text += document_parser.parse_document(file_bytes, filename) + "\n\n"
        except Exception as e:
            print(f"Error parsing syllabus file for topic context: {e}")

    for res in subject_record.resources:
        if res.file_path and os.path.exists(res.file_path):
            try:
                with open(res.file_path, "rb") as f:
                    file_bytes = f.read()
                filename = os.path.basename(res.file_path)
                raw_text += document_parser.parse_document(file_bytes, filename) + "\n\n"
            except Exception as e:
                print(f"Error parsing resource file for topic context: {e}")

    content_text = ""
    if raw_text:
        content_text = get_semantic_context(raw_text, topic.topic_name)

    new_topic = models.Topic(
        subject_id=subject_id,
        topic_name=topic.topic_name,
        difficulty_weight=topic.difficulty_weight,
        estimated_hours=topic.estimated_hours,
        preferred_time=topic.preferred_time,
        content_text=content_text
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic

@router.post("/subjects/{subject_id}/topics/bulk", response_model=List[schemas.TopicOut], status_code=status.HTTP_201_CREATED)
def create_topics_bulk(
    subject_id: int,
    topics: List[schemas.TopicCreate],
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject_record = db.query(models.Subject).filter(
        models.Subject.subject_id == subject_id,
        models.Subject.student_id == current_user.student_id
    ).first()
    
    if not subject_record:
        raise HTTPException(status_code=404, detail="Subject not found")

    raw_text = ""
    if subject_record.file_path and os.path.exists(subject_record.file_path):
        try:
            with open(subject_record.file_path, "rb") as f:
                file_bytes = f.read()
            filename = os.path.basename(subject_record.file_path)
            raw_text += document_parser.parse_document(file_bytes, filename) + "\n\n"
        except Exception as e:
            print(f"Error parsing syllabus file for bulk topic context: {e}")

    for res in subject_record.resources:
        if res.file_path and os.path.exists(res.file_path):
            try:
                with open(res.file_path, "rb") as f:
                    file_bytes = f.read()
                filename = os.path.basename(res.file_path)
                raw_text += document_parser.parse_document(file_bytes, filename) + "\n\n"
            except Exception as e:
                print(f"Error parsing resource file for bulk topic context: {e}")

    added_topics = []
    for topic in topics:
        content_text = ""
        if raw_text:
            content_text = get_semantic_context(raw_text, topic.topic_name)

        new_topic = models.Topic(
            subject_id=subject_id,
            topic_name=topic.topic_name,
            difficulty_weight=topic.difficulty_weight,
            estimated_hours=topic.estimated_hours,
            preferred_time=topic.preferred_time,
            content_text=content_text
        )
        db.add(new_topic)
        added_topics.append(new_topic)
        
    db.commit()
    for t in added_topics:
        db.refresh(t)
    return added_topics

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

@router.put("/subjects/{subject_id}/topics/{topic_id}", response_model=schemas.TopicOut)
def update_topic(
    subject_id: int,
    topic_id: int,
    topic: schemas.TopicCreate,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject = db.query(models.Subject).filter(models.Subject.subject_id == subject_id, models.Subject.student_id == current_user.student_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    topic_record = db.query(models.Topic).filter(models.Topic.topic_id == topic_id, models.Topic.subject_id == subject_id).first()
    if not topic_record:
        raise HTTPException(status_code=404, detail="Topic not found")
    topic_record.topic_name = topic.topic_name
    topic_record.difficulty_weight = topic.difficulty_weight
    topic_record.estimated_hours = topic.estimated_hours
    topic_record.preferred_time = topic.preferred_time
    db.commit()
    db.refresh(topic_record)
    return topic_record


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
