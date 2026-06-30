from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from backend.core.database import Base

class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    prediction_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), index=True)
    
    # Input features used for prediction
    mcq_accuracy = Column(Float, default=0.0)
    avg_response_time = Column(Float, default=0.0)
    skip_count = Column(Integer, default=0)
    
    # Outputs
    topic_mastery = Column(String) # Strong/Moderate/Weak
    exam_readiness_prob = Column(Float) # 0 to 1
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student")
