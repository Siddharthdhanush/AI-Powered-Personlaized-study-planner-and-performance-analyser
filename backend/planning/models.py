from sqlalchemy import Column, Integer, Date, Boolean, ForeignKey, String
from sqlalchemy.orm import relationship
from backend.core.database import Base

class StudyPlan(Base):
    __tablename__ = "study_plans"

    plan_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), index=True)
    topic_id = Column(Integer, ForeignKey("topics.topic_id"), index=True)
    planned_date = Column(Date, index=True)
    planned_minutes = Column(Integer)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    is_remedial = Column(Boolean, default=False)

    # Note: If we need relationships back to student and topic, we can add them:
    # student = relationship("Student")
    # topic = relationship("Topic")
