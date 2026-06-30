from pydantic import BaseModel
from typing import List, Optional
import datetime

# --- Questions ---
class QuestionBase(BaseModel):
    question_text: str
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: str
    explanation: str
    difficulty: str
    question_type: Optional[str] = "MCQ"

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

# --- Summary ---
class SummaryResponse(BaseModel):
    topic_name: str
    summary: str

# --- Flashcards ---
class FlashcardItem(BaseModel):
    front: str
    back: str

class FlashcardResponse(BaseModel):
    topic_name: str
    flashcards: List[FlashcardItem]

# --- Hints ---
class HintResponse(BaseModel):
    topic_name: str
    hints: List[str]

# --- Explanation ---
class ExplanationResponse(BaseModel):
    topic_name: str
    explanation: str

# --- Mock Test ---
class MockTestQuestion(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: str
    difficulty: str
    topic: Optional[str] = None

class MockTestRequest(BaseModel):
    subject_id: int
    num_questions: Optional[int] = 10

class MockTestResponse(BaseModel):
    message: str
    questions: List[MockTestQuestion]

# --- Study Strategy ---
class TimeAllocation(BaseModel):
    topic: str
    hours: float
    technique: Optional[str] = None

class DailyPlan(BaseModel):
    day: int
    focus: str
    activities: Optional[str] = None

class StudyStrategyRequest(BaseModel):
    subject_id: int
    days_until_exam: int
    hours_per_day: Optional[float] = 3.0

class StudyStrategyResponse(BaseModel):
    strategy_summary: str
    topic_order: List[str]
    time_allocation: List[TimeAllocation]
    daily_plan: List[DailyPlan]
    revision_tips: List[str]
    motivation: Optional[str] = None

# --- Wellness ---
class WellnessRequest(BaseModel):
    study_hours_today: Optional[float] = 0
    days_until_exam: Optional[int] = 7

class WellnessResponse(BaseModel):
    wellness_tip: str
    motivation_quote: str
    break_activity: str
    health_reminder: str
    mood_emoji: Optional[str] = None


