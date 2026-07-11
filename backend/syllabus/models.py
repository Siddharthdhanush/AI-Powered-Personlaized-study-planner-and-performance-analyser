from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from backend.core.database import Base

class Subject(Base):
    __tablename__ = "subjects"

    subject_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), index=True)
    subject_name = Column(String, index=True)
    file_path = Column(String, nullable=True)

    # Relationships
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="subject", cascade="all, delete-orphan")
    resources = relationship("SubjectResource", back_populates="subject", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"

    topic_id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), index=True)
    topic_name = Column(String, index=True)
    difficulty_weight = Column(Float, default=2.0)
    estimated_hours = Column(Float, default=2.0)
    preferred_time = Column(String, nullable=True)
    content_text = Column(String, nullable=True)

    subject = relationship("Subject", back_populates="topics")

class Exam(Base):
    __tablename__ = "exams"

    exam_id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), index=True)
    exam_date = Column(Date)

    subject = relationship("Subject", back_populates="exams")

class SubjectResource(Base):
    __tablename__ = "subject_resources"

    resource_id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), index=True)
    filename = Column(String)
    file_path = Column(String)

    subject = relationship("Subject", back_populates="resources")
