from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PredictionResponse(BaseModel):
    topic_mastery: str
    exam_readiness_prob: float
    mcq_accuracy: float
    avg_response_time: float
    skip_count: int
    timestamp: datetime
    
    class Config:
        from_attributes = True
