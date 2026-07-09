from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PredictionResponse(BaseModel):
    topic_mastery: str
    exam_readiness_prob: float
    mcq_accuracy: float
    avg_response_time: float
    skip_count: int
    timestamp: datetime
    weak_topics: Optional[List[str]] = []
    
    class Config:
        from_attributes = True

class MLPredictionOut(BaseModel):
    prediction_id: int
    student_id: int
    mcq_accuracy: float
    avg_response_time: float
    skip_count: int
    topic_mastery: str
    exam_readiness_prob: float
    timestamp: datetime
    
    class Config:
        from_attributes = True
