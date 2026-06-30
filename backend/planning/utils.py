from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.user.models import Preferences
from backend.syllabus.models import Topic, Exam
from backend.planning.models import StudyPlan

def generate_timetable(db: Session, student_id: int, subject_id: int):
    # 1. Fetch preferences for daily hours
    prefs = db.query(Preferences).filter(Preferences.student_id == student_id).first()
    if not prefs:
        raise HTTPException(status_code=400, detail="Student preferences not set")
    daily_minutes_available = int(prefs.daily_hours * 60)

    # 2. Fetch Exam Date
    exam = db.query(Exam).filter(Exam.subject_id == subject_id).first()
    if not exam:
        raise HTTPException(status_code=400, detail="Exam date not set for this subject")
    
    # Initialize topics tracking
    topic_queue = []
    topics_query = db.query(Topic).filter(Topic.subject_id == exam.subject_id).all()
    topic_time_map = {t.topic_id: t.preferred_time for t in topics_query}
    
    for t in topics_query:
        topic_queue.append({
            "topic_id": t.topic_id,
            "minutes_left": int(t.estimated_hours * t.difficulty_weight * 60)
        })

    # Clean existing study plans for this subject to regenerate
    # We find all study plans for the user that belong to topics of this subject
    topic_ids = [t.topic_id for t in topics_query]
    db.query(StudyPlan).filter(
        StudyPlan.student_id == student_id,
        StudyPlan.topic_id.in_(topic_ids)
    ).delete(synchronize_session=False)

    # 4. Distribution Algorithm
    # For MVP, we will simply allocate chunks of time to topics sequentially 
    # until we hit the exam date or finish the topics.
    
    current_date = date.today()
    if current_date > exam.exam_date:
        raise HTTPException(status_code=400, detail="Exam date is in the past")

    created_plans = []
    
    # Allocate sequentially day by day
    while topic_queue and current_date < exam.exam_date:
        minutes_remaining_today = daily_minutes_available
        
        # Parse the start time for the day
        try:
            current_time = datetime.strptime(prefs.study_start_time, "%H:%M")
        except:
            current_time = datetime.strptime("17:30", "%H:%M")

        while minutes_remaining_today > 0 and topic_queue:
            current_topic = topic_queue[0]
            
            # Use preferred time if available (forces a jump to that time)
            topic_pref = topic_time_map.get(current_topic["topic_id"])
            if topic_pref:
                try:
                    pref_dt = datetime.strptime(topic_pref, "%H:%M")
                    # To avoid going backwards in a single day, we use max
                    if current_time.time() < pref_dt.time():
                        current_time = pref_dt
                except:
                    pass
            
            # Allocate up to the max we can do today
            allocate_time = min(minutes_remaining_today, current_topic["minutes_left"])
            
            if allocate_time > 0:
                start_str = current_time.strftime("%H:%M")
                current_time += timedelta(minutes=allocate_time)
                end_str = current_time.strftime("%H:%M")
                
                plan = StudyPlan(
                    student_id=student_id,
                    topic_id=current_topic["topic_id"],
                    planned_date=current_date,
                    planned_minutes=allocate_time,
                    start_time=start_str,
                    end_time=end_str,
                    is_completed=False
                )
                db.add(plan)
                created_plans.append(plan)
                
                # Add break time for next session on same day
                current_time += timedelta(minutes=prefs.break_duration)
            
            current_topic["minutes_left"] -= allocate_time
            minutes_remaining_today -= allocate_time

            # If topic finished, remove from queue
            if current_topic["minutes_left"] <= 0:
                topic_queue.pop(0)

        # Move to next day
        current_date += timedelta(days=1)

    # Note: If topic_queue is not empty here, the user doesn't have enough days/hours to finish the syllabus.
    # We could return a warning, but for now we just commit what we generated.
    db.commit()

    return {"message": "Timetable generated successfully", "plans_created": len(created_plans)}
