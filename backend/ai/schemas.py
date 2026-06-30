from pydantic import BaseModel
from typing import List, Optional
import datetime

# --- Questions ---
class QuestionBase(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: str
    difficulty: str

class QuestionOut(QuestionBase):
    question_id: int
    topic_id: int
    generated_by: str

    class Config:
        from_attributes = True

class QuizGenerationResponse(BaseModel):
    message: str
    questions: List[QuestionOut]

# --- Assessments ---
class AnswerSubmission(BaseModel):
    question_id: int
    selected_option: Optional[str] = None
    response_time: float
    is_skipped: bool

class AssessmentSubmit(BaseModel):
    topic_id: int
    answers: List[AnswerSubmission]

class AssessmentOut(BaseModel):
    assessment_id: int
    student_id: int
    topic_id: int
    score: float
    attempt_date: datetime.datetime

    class Config:
        from_attributes = True

# --- Syllabus Extraction ---
class ExtractedTopic(BaseModel):
    topic_name: str
    difficulty_weight: float
    estimated_hours: float

class ExtractionResponse(BaseModel):
    message: str
    topics_added: int
    topics: List[ExtractedTopic]
