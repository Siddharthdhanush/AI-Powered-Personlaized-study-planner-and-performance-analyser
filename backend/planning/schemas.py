from pydantic import BaseModel
from typing import Optional
from datetime import date

class StudyPlanBase(BaseModel):
    topic_id: int
    planned_date: date
    planned_minutes: int
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_completed: Optional[bool] = False
    is_remedial: Optional[bool] = False

class StudyPlanCreate(StudyPlanBase):
    student_id: int

class StudyPlanOut(StudyPlanBase):
    plan_id: int
    student_id: int

    class Config:
        from_attributes = True

class StudyPlanUpdate(BaseModel):
    planned_date: date
    planned_minutes: int
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class GenerateTimetablePayload(BaseModel):
    subject_ids: list[int]

