from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# --- Topic Schemas ---
class TopicBase(BaseModel):
    topic_name: str
    difficulty_weight: Optional[float] = 1.0
    estimated_hours: Optional[float] = 2.0
    preferred_time: Optional[str] = None

class TopicCreate(TopicBase):
    pass

class TopicOut(TopicBase):
    topic_id: int
    subject_id: int

    class Config:
        from_attributes = True

# --- Exam Schemas ---
class ExamBase(BaseModel):
    exam_date: date

class ExamCreate(ExamBase):
    pass

class ExamOut(ExamBase):
    exam_id: int
    subject_id: int

    class Config:
        from_attributes = True

# --- Subject Schemas ---
class SubjectBase(BaseModel):
    subject_name: str

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    subject_id: int
    student_id: int
    file_path: Optional[str] = None
    topics: List[TopicOut] = []
    exams: List[ExamOut] = []

    class Config:
        from_attributes = True
