from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from backend.core.database import Base

class Question(Base):
    __tablename__ = "questions"

    question_id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.topic_id"), index=True)
    
    question_text = Column(String)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_option = Column(String) # A, B, C, or D
    explanation = Column(String)
    
    difficulty = Column(String, default="Medium") # Easy, Medium, Hard
    generated_by = Column(String, default="ollama")
    question_type = Column(String, default="MCQ") # MCQ, FIB, DESCRIPTIVE

    # Relationships
    topic = relationship("Topic")

class Assessment(Base):
    __tablename__ = "assessments"

    assessment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), index=True)
    topic_id = Column(Integer, ForeignKey("topics.topic_id"), index=True)
    
    attempt_date = Column(DateTime, default=datetime.datetime.utcnow)
    score = Column(Float, nullable=True) # Will be calculated after submission
    
    # Relationships
    answers = relationship("AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    answer_id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.assessment_id"), index=True)
    question_id = Column(Integer, ForeignKey("questions.question_id"))
    
    selected_option = Column(String, nullable=True)
    is_correct = Column(Boolean, default=False)
    response_time = Column(Float, nullable=True) # Seconds
    is_skipped = Column(Boolean, default=False)
    
    # Relationships
    assessment = relationship("Assessment", back_populates="answers")
    question = relationship("Question")
