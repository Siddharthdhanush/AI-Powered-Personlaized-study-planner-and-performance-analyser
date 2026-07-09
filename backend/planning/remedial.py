from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from backend.user.models import Preferences
from backend.planning.models import StudyPlan
from backend.planning.utils import get_next_available_slot

def schedule_extra_remedial_session(db: Session, student_id: int, topic_id: int):
    """
    Schedules an extra remedial study plan session (e.g. 45 minutes) for the given topic
    starting from tomorrow morning.
    """
    prefs = db.query(Preferences).filter(Preferences.student_id == student_id).first()
    if not prefs:
        return None
        
    # Start searching from tomorrow morning at study_start_time
    tomorrow = date.today() + timedelta(days=1)
    try:
        start_time_dt = datetime.strptime(prefs.study_start_time, "%H:%M")
    except:
        start_time_dt = datetime.strptime("17:30", "%H:%M")
        
    start_dt = datetime.combine(tomorrow, start_time_dt.time())
    allocate_minutes = 45 # Remedial review session duration
    
    actual_date, slot_start, slot_end = get_next_available_slot(
        db, student_id, tomorrow, start_dt, allocate_minutes, prefs
    )
    
    plan = StudyPlan(
        student_id=student_id,
        topic_id=topic_id,
        planned_date=actual_date,
        start_time=slot_start.strftime("%H:%M"),
        end_time=slot_end.strftime("%H:%M"),
        planned_minutes=allocate_minutes,
        is_completed=False,
        is_remedial=True
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan
