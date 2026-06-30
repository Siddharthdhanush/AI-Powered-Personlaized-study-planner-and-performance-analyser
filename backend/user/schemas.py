from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Student Schemas ---
class StudentBase(BaseModel):
    name: str
    email: EmailStr

class StudentCreate(StudentBase):
    password: str

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class StudentOut(StudentBase):
    student_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Preferences Schemas ---
class PreferencesBase(BaseModel):
    daily_hours: float
    wake_time: str
    sleep_time: str
    study_start_time: str = "17:30"
    break_duration: int
    college_start_time: Optional[str] = "09:00"
    college_end_time: Optional[str] = "16:00"
    busy_start_time: Optional[str] = "18:00"
    busy_end_time: Optional[str] = "19:00"

class PreferencesUpdate(PreferencesBase):
    daily_hours: Optional[float] = None
    wake_time: Optional[str] = None
    sleep_time: Optional[str] = None
    study_start_time: Optional[str] = None
    break_duration: Optional[int] = None
    college_start_time: Optional[str] = None
    college_end_time: Optional[str] = None
    busy_start_time: Optional[str] = None
    busy_end_time: Optional[str] = None

class PreferencesOut(PreferencesBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

# --- Progress Schemas ---
class ProgressBase(BaseModel):
    accuracy: float
    response_time: float
    readiness: float

class ProgressCreate(ProgressBase):
    pass

class ProgressOut(ProgressBase):
    id: int
    student_id: int
    recorded_at: datetime

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
