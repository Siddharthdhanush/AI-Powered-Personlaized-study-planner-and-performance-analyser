from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime

from backend.core import database
from . import models, schemas, utils, auth

router = APIRouter()

# --- Auth Routes ---
@router.post("/register", response_model=schemas.StudentOut, status_code=status.HTTP_201_CREATED)
def register(student: schemas.StudentCreate, db: Session = Depends(database.get_db)):
    if len(student.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
    db_user = db.query(models.Student).filter(models.Student.email == student.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = utils.get_password_hash(student.password)
    new_student = models.Student(
        name=student.name, 
        email=student.email, 
        password_hash=hashed_password
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    # Create default preferences for the new user
    default_prefs = models.Preferences(
        student_id=new_student.student_id,
        college_start_time="09:00",
        college_end_time="16:00",
        busy_start_time="18:00",
        busy_end_time="19:00"
    )
    db.add(default_prefs)
    db.commit()
    
    return new_student

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.Student).filter(models.Student.email == form_data.username).first()
    if not user or not utils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Record session login
    new_session = models.Session(student_id=user.student_id)
    db.add(new_session)
    db.commit()

    access_token = utils.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(current_user: models.Student = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Find the most recent session and set logout_time
    # This is a simplified logout logic
    active_session = db.query(models.Session).filter(
        models.Session.student_id == current_user.student_id,
        models.Session.logout_time == None
    ).order_by(models.Session.login_time.desc()).first()

    if active_session:
        active_session.logout_time = datetime.utcnow()
        db.commit()
        
    return {"msg": "Successfully logged out"}

# --- Profile Routes ---
@router.get("/profile", response_model=schemas.StudentOut)
def get_profile(current_user: models.Student = Depends(auth.get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.StudentOut)
def update_profile(
    profile_data: schemas.StudentUpdate, 
    current_user: models.Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.email is not None:
        current_user.email = profile_data.email
    db.commit()
    db.refresh(current_user)
    return current_user

# --- Preferences Routes ---
@router.get("/preferences", response_model=schemas.PreferencesOut)
def get_preferences(current_user: models.Student = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    prefs = db.query(models.Preferences).filter(models.Preferences.student_id == current_user.student_id).first()
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return prefs

@router.put("/preferences", response_model=schemas.PreferencesOut)
def update_preferences(
    prefs_data: schemas.PreferencesUpdate,
    current_user: models.Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    prefs = db.query(models.Preferences).filter(models.Preferences.student_id == current_user.student_id).first()
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
    
    if prefs_data.daily_hours is not None: prefs.daily_hours = prefs_data.daily_hours
    if prefs_data.wake_time is not None: prefs.wake_time = prefs_data.wake_time
    if prefs_data.sleep_time is not None: prefs.sleep_time = prefs_data.sleep_time
    if prefs_data.break_duration is not None: prefs.break_duration = prefs_data.break_duration
    if prefs_data.study_start_time is not None: prefs.study_start_time = prefs_data.study_start_time
    if prefs_data.college_start_time is not None: prefs.college_start_time = prefs_data.college_start_time
    if prefs_data.college_end_time is not None: prefs.college_end_time = prefs_data.college_end_time
    if prefs_data.busy_start_time is not None: prefs.busy_start_time = prefs_data.busy_start_time
    if prefs_data.busy_end_time is not None: prefs.busy_end_time = prefs_data.busy_end_time
    
    db.commit()
    db.refresh(prefs)
    return prefs

# --- Progress Routes ---
@router.get("/progress", response_model=list[schemas.ProgressOut])
def get_progress(current_user: models.Student = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    progress_records = db.query(models.Progress).filter(models.Progress.student_id == current_user.student_id).all()
    return progress_records
