from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.core.database import Base

class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    preferences = relationship("Preferences", back_populates="student", uselist=False)
    progress = relationship("Progress", back_populates="student")
    sessions = relationship("Session", back_populates="student")

class Preferences(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), unique=True)
    daily_hours = Column(Float, default=2.0)
    wake_time = Column(String, default="07:00")
    sleep_time = Column(String, default="23:00")
    study_start_time = Column(String, default="17:30")
    break_duration = Column(Integer, default=15) # in minutes

    student = relationship("Student", back_populates="preferences")

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    accuracy = Column(Float, default=0.0)
    response_time = Column(Float, default=0.0)
    readiness = Column(Float, default=0.0)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="progress")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    login_time = Column(DateTime, default=datetime.utcnow)
    logout_time = Column(DateTime, nullable=True)
    device = Column(String, nullable=True)

    student = relationship("Student", back_populates="sessions")
