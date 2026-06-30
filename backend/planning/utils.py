from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.user.models import Preferences
from backend.syllabus.models import Topic, Exam
from backend.planning.models import StudyPlan

def get_next_available_slot(db: Session, student_id: int, target_date: date, current_time: datetime, duration_minutes: int, prefs) -> tuple[date, datetime, datetime]:
    """
    Finds the next valid slot for a session that:
    1. Does not overlap with college hours.
    2. Does not overlap with busy hours.
    3. Does not overlap with sleeping/morning chores hours.
    4. Does not overlap with existing scheduled plans for other subjects.
    
    Returns (actual_date, start_datetime, end_datetime)
    """
    import json
    
    # Parse weekly configs if set, fallback to default prefs values
    weekly_college = {}
    weekly_busy = {}
    
    if getattr(prefs, 'weekly_college_timings', None):
        try:
            weekly_college = json.loads(prefs.weekly_college_timings)
        except:
            pass
            
    if getattr(prefs, 'weekly_busy_timings', None):
        try:
            weekly_busy = json.loads(prefs.weekly_busy_timings)
        except:
            pass

    sleep_t = datetime.strptime(prefs.sleep_time, "%H:%M").time()
    study_start_t = datetime.strptime(prefs.study_start_time, "%H:%M").time()
    
    proposed_start = datetime.combine(target_date, current_time.time())
    
    attempts = 0
    while attempts < 1000:
        day_name = proposed_start.strftime("%A") # "Monday", "Tuesday", etc.
        
        # 1. Sleep/morning chores hours overlap (between sleep_t and study_start_t)
        start_time_only = proposed_start.time()
        proposed_end = proposed_start + timedelta(minutes=duration_minutes)
        end_time_only = proposed_end.time()
        
        in_sleep = False
        if sleep_t > study_start_t:
            if start_time_only >= sleep_t or start_time_only < study_start_t or end_time_only > sleep_t or end_time_only <= study_start_t:
                in_sleep = True
        else:
            if sleep_t <= start_time_only < study_start_t or sleep_t < end_time_only <= study_start_t:
                in_sleep = True
                
        if in_sleep:
            if start_time_only < study_start_t:
                proposed_start = datetime.combine(proposed_start.date(), study_start_t)
            else:
                proposed_start = datetime.combine(proposed_start.date() + timedelta(days=1), study_start_t)
            attempts += 1
            continue
            
        # 2. College hours overlap (customized by day)
        day_college = weekly_college.get(day_name, {"start": prefs.college_start_time, "end": prefs.college_end_time})
        c_start_str = day_college.get("start") or prefs.college_start_time or "09:00"
        c_end_str = day_college.get("end") or prefs.college_end_time or "16:00"
        college_start = datetime.strptime(c_start_str, "%H:%M").time()
        college_end = datetime.strptime(c_end_str, "%H:%M").time()
        
        in_college = False
        if college_start < college_end:
            if not (end_time_only <= college_start or start_time_only >= college_end):
                in_college = True
        if in_college:
            proposed_start = datetime.combine(proposed_start.date(), college_end)
            attempts += 1
            continue
            
        # 3. Busy hours overlap (customized by day)
        day_busy = weekly_busy.get(day_name, {"start": prefs.busy_start_time, "end": prefs.busy_end_time})
        b_start_str = day_busy.get("start") or prefs.busy_start_time or "18:00"
        b_end_str = day_busy.get("end") or prefs.busy_end_time or "19:00"
        busy_start = datetime.strptime(b_start_str, "%H:%M").time()
        busy_end = datetime.strptime(b_end_str, "%H:%M").time()
        
        in_busy = False
        if busy_start < busy_end:
            if not (end_time_only <= busy_start or start_time_only >= busy_end):
                in_busy = True
        if in_busy:
            proposed_start = datetime.combine(proposed_start.date(), busy_end)
            attempts += 1
            continue
            
        # 4. Overlap with existing plans in database
        overlap_plans = db.query(StudyPlan).filter(
            StudyPlan.student_id == student_id,
            StudyPlan.planned_date == proposed_start.date()
        ).all()
        
        has_overlap = False
        overlapping_end = None
        for plan in overlap_plans:
            if not plan.start_time or not plan.end_time:
                continue
            p_start = datetime.strptime(plan.start_time, "%H:%M").time()
            p_end = datetime.strptime(plan.end_time, "%H:%M").time()
            
            if not (end_time_only <= p_start or start_time_only >= p_end):
                has_overlap = True
                overlapping_end = p_end
                break
                
        if has_overlap:
            # Jump to end of overlapping session + break duration
            proposed_start = datetime.combine(proposed_start.date(), overlapping_end) + timedelta(minutes=prefs.break_duration)
            attempts += 1
            continue
            
        # Found slot!
        return proposed_start.date(), proposed_start, proposed_end
        
    return proposed_start.date(), proposed_start, proposed_start + timedelta(minutes=duration_minutes)

def generate_timetable(db: Session, student_id: int, subject_id: int):
    return generate_timetable_multiple(db, student_id, [subject_id])

def generate_timetable_multiple(db: Session, student_id: int, subject_ids: list[int]):
    from sqlalchemy import func
    # 1. Fetch preferences
    prefs = db.query(Preferences).filter(Preferences.student_id == student_id).first()
    if not prefs:
        raise HTTPException(status_code=400, detail="Student preferences not set")
    daily_minutes_available = int(prefs.daily_hours * 60)

    # 2. Fetch Exams for the selected subjects
    exams = db.query(Exam).filter(Exam.subject_id.in_(subject_ids)).all()
    if not exams:
        raise HTTPException(status_code=400, detail="Exam dates not set for selected subjects")
    
    # Map subject_id to exam_date
    exam_dates = {e.subject_id: e.exam_date for e in exams}
    
    # 3. Fetch Topics for all selected subjects
    topics_query = db.query(Topic).filter(Topic.subject_id.in_(subject_ids)).all()
    
    # Initialize topics tracking and prioritize
    from backend.ai.models import Assessment
    
    topics_with_priority = []
    for t in topics_query:
        # Get latest assessment score for this topic
        latest_assessment = db.query(Assessment).filter(
            Assessment.student_id == student_id,
            Assessment.topic_id == t.topic_id
        ).order_by(Assessment.attempt_date.desc()).first()
        
        score = latest_assessment.score if latest_assessment else None
        
        # Priority calculation:
        # If score is low (<60%), boost priority significantly
        # If they haven't taken a quiz yet, give it baseline priority + 1.0 (to study before mastered ones)
        if score is not None:
            priority = t.difficulty_weight + (100.0 - score) / 10.0
        else:
            priority = t.difficulty_weight + 1.0
            
        # Give higher priority to subjects whose exams are closer!
        exam_date = exam_dates.get(t.subject_id)
        if exam_date:
            days_until_exam = (exam_date - date.today()).days
            # Boost priority for closer exam dates
            if days_until_exam > 0:
                priority += max(0.0, (30.0 - days_until_exam) / 2.0)
            
        topics_with_priority.append({
            "topic_id": t.topic_id,
            "subject_id": t.subject_id,
            "minutes_left": int(t.estimated_hours * 60),
            "priority": priority,
            "exam_date": exam_date
        })
        
    # Sort topics by priority descending (weakest first, closest exam first)
    topics_with_priority.sort(key=lambda x: x["priority"], reverse=True)
    topic_queue = topics_with_priority

    # Clean existing study plans for these subjects to regenerate
    topic_ids = [t.topic_id for t in topics_query]
    db.query(StudyPlan).filter(
        StudyPlan.student_id == student_id,
        StudyPlan.topic_id.in_(topic_ids)
    ).delete(synchronize_session=False)

    current_date = date.today()
    created_plans = []
    
    # Start time for the day
    try:
        start_time_dt = datetime.strptime(prefs.study_start_time, "%H:%M")
    except:
        start_time_dt = datetime.strptime("17:30", "%H:%M")
        
    current_sched_dt = datetime.combine(current_date, start_time_dt.time())

    while topic_queue:
        # We need to filter topic_queue to only those whose exam_date is in the future relative to the pointer date
        valid_topics = [t for t in topic_queue if t["exam_date"] and current_sched_dt.date() < t["exam_date"]]
        if not valid_topics:
            # No topics left that can be scheduled before their respective exam dates!
            break
            
        # Calculate already scheduled minutes for the student on this specific date
        existing_minutes = db.query(func.sum(StudyPlan.planned_minutes)).filter(
            StudyPlan.student_id == student_id,
            StudyPlan.planned_date == current_sched_dt.date()
        ).scalar() or 0
        
        minutes_remaining_today = daily_minutes_available - int(existing_minutes)

        if minutes_remaining_today <= 0:
            # Move pointer to tomorrow morning
            current_sched_dt = datetime.combine(current_sched_dt.date() + timedelta(days=1), start_time_dt.time())
            continue

        # Get the highest priority topic that is valid
        current_topic = valid_topics[0]
        allocate_time = min(minutes_remaining_today, current_topic["minutes_left"])

        if allocate_time > 0:
            actual_date, slot_start, slot_end = get_next_available_slot(
                db, student_id, current_sched_dt.date(), current_sched_dt, allocate_time, prefs
            )
            
            # If the slot got pushed to a future date, reset scheduling pointer to that date's morning
            if actual_date > current_sched_dt.date():
                current_sched_dt = datetime.combine(actual_date, start_time_dt.time())
                continue
                
            plan = StudyPlan(
                student_id=student_id,
                topic_id=current_topic["topic_id"],
                planned_date=actual_date,
                planned_minutes=allocate_time,
                start_time=slot_start.strftime("%H:%M"),
                end_time=slot_end.strftime("%H:%M"),
                is_completed=False
            )
            db.add(plan)
            db.flush()
            created_plans.append(plan)
            
            # Advance time pointer by slot duration + break duration
            current_sched_dt = slot_end + timedelta(minutes=prefs.break_duration)
            
            # Subtract allocated time from the topic in the main queue
            for q_topic in topic_queue:
                if q_topic["topic_id"] == current_topic["topic_id"]:
                    q_topic["minutes_left"] -= allocate_time
                    if q_topic["minutes_left"] <= 0:
                        topic_queue.remove(q_topic)
                    break
        else:
            # Move pointer to tomorrow morning
            current_sched_dt = datetime.combine(current_sched_dt.date() + timedelta(days=1), start_time_dt.time())

    db.commit()
    return {"message": "Timetable generated successfully", "plans_created": len(created_plans)}
