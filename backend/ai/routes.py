from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.core import database
from backend.user import auth
from backend.user.models import Student
from backend.syllabus.models import Subject, Topic
from . import schemas, models
from . import syllabus_generator, document_parser, question_generator
from . import summary_generator, flashcard_generator, hint_generator
from . import explanation_generator, mocktest_generator, study_strategy, wellness

router = APIRouter()

@router.post("/quiz/generate/{topic_id}", response_model=schemas.QuizGenerationResponse)
def generate_quiz(
    topic_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    # Clear old questions for this topic to avoid stale MCQs
    db.query(models.Question).filter(models.Question.topic_id == topic_id).delete()
    db.commit()
        
    try:
        raw_questions = question_generator.generate_quiz_for_topic(topic.topic_name, num_questions=9, context=topic.content_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    saved_questions = []
    for q_data in raw_questions:
        q = models.Question(
            topic_id=topic.topic_id,
            question_text=q_data.get("question_text", "Missing Question"),
            option_a=q_data.get("option_a") or "",
            option_b=q_data.get("option_b") or "",
            option_c=q_data.get("option_c") or "",
            option_d=q_data.get("option_d") or "",
            correct_option=q_data.get("correct_option", ""),
            explanation=q_data.get("explanation", ""),
            difficulty=q_data.get("difficulty", "Medium"),
            question_type=q_data.get("question_type", "MCQ"),
            generated_by="ollama"
        )
        db.add(q)
        saved_questions.append(q)
    
    db.commit()
    for q in saved_questions:
        db.refresh(q)

    return {"message": "Quiz generated successfully", "questions": saved_questions}

@router.post("/syllabus/extract/{subject_id}", response_model=schemas.ExtractionResponse)
def extract_syllabus(
    subject_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Verify subject belongs to user
    subject_record = db.query(Subject).filter(
        Subject.subject_id == subject_id,
        Subject.student_id == current_user.student_id
    ).first()
    
    if not subject_record:
        raise HTTPException(status_code=404, detail="Subject not found")

    if not subject_record.file_path:
        raise HTTPException(status_code=400, detail="No syllabus file uploaded for this subject.")

    # 1. Parse Document
    try:
        import os
        with open(subject_record.file_path, "rb") as f:
            file_bytes = f.read()
        filename = os.path.basename(subject_record.file_path)
        raw_text = document_parser.parse_document(file_bytes, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse document: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Uploaded document contains no readable text.")

    # 2. Extract Topics using AI
    try:
        raw_topics = syllabus_generator.extract_syllabus_topics(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")

    return {
        "message": f"Successfully extracted {len(raw_topics)} topics",
        "topics_added": 0,
        "topics": raw_topics
    }

@router.post("/quiz/generate", response_model=schemas.QuizGenerationResponse)
def generate_adaptive_quiz(
    payload: schemas.AdaptiveQuizRequest,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if not payload.topic_ids:
        raise HTTPException(status_code=400, detail="No topic IDs provided")
        
    topics_list = []
    for t_id in payload.topic_ids:
        topic = db.query(Topic).filter(Topic.topic_id == t_id).first()
        if not topic:
            continue
            
        weight = topic.difficulty_weight or 2.0
        if weight >= 4.0:
            num_q = 4
        elif weight >= 2.0:
            num_q = 3
        else:
            num_q = 2
            
        topics_list.append({
            "topic_id": topic.topic_id,
            "topic_name": topic.topic_name,
            "num_questions": num_q,
            "content_text": topic.content_text
        })
        
        # Clear old questions for this topic to avoid duplicates
        db.query(models.Question).filter(models.Question.topic_id == t_id).delete()
        db.commit()
        
    try:
        raw_questions = question_generator.generate_quiz_for_topics_adaptive(topics_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    saved_questions = []
    name_to_id = {t["topic_name"]: t["topic_id"] for t in topics_list}
    
    for q_data in raw_questions:
        q_topic_name = q_data.get("topic_name")
        q_topic_id = name_to_id.get(q_topic_name, payload.topic_ids[0])
        
        q = models.Question(
            topic_id=q_topic_id,
            question_text=q_data.get("question_text", "Missing Question"),
            option_a=q_data.get("option_a") or "",
            option_b=q_data.get("option_b") or "",
            option_c=q_data.get("option_c") or "",
            option_d=q_data.get("option_d") or "",
            correct_option=q_data.get("correct_option", ""),
            explanation=q_data.get("explanation", ""),
            difficulty=q_data.get("difficulty", "Medium"),
            question_type=q_data.get("question_type", "MCQ"),
            generated_by="ollama"
        )
        db.add(q)
        saved_questions.append(q)
        
    db.commit()
    for q in saved_questions:
        db.refresh(q)
        
    return {"message": "Adaptive quiz generated successfully", "questions": saved_questions}

@router.post("/assessment/submit", response_model=schemas.AssessmentOut)
def submit_assessment(
    data: schemas.AssessmentSubmit,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Group submitted answers by their question's topic_id
    answers_by_topic = {}
    for ans_data in data.answers:
        q = db.query(models.Question).filter(models.Question.question_id == ans_data.question_id).first()
        if q:
            t_id = q.topic_id
            if t_id not in answers_by_topic:
                answers_by_topic[t_id] = []
            answers_by_topic[t_id].append((ans_data, q))

    created_assessments = []
    total_questions = 0
    total_correct = 0

    for t_id, answer_pairs in answers_by_topic.items():
        assessment = models.Assessment(
            student_id=current_user.student_id,
            topic_id=t_id
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

        correct_count = 0
        for ans_data, q in answer_pairs:
            is_correct = False
            if not ans_data.is_skipped and ans_data.selected_option:
                q_type = getattr(q, 'question_type', 'MCQ')
                user_ans = ans_data.selected_option.strip()
                correct_ans = q.correct_option.strip()
                
                if q_type == 'MCQ':
                    clean_correct = correct_ans.split(",")[0].strip().upper()
                    if user_ans.upper() == clean_correct or user_ans.upper() == correct_ans.upper():
                        is_correct = True
                elif q_type == 'MULTI_MCQ':
                    u_opts = sorted([o.strip().upper() for o in user_ans.split(",") if o.strip()])
                    c_opts = sorted([o.split(",")[0].strip().upper() for o in correct_ans.split(",") if o.strip()])
                    if u_opts == c_opts or sorted([o.strip().upper() for o in user_ans.split(",") if o.strip()]) == sorted([o.strip().upper() for o in correct_ans.split(",") if o.strip()]):
                        is_correct = True
                elif q_type == 'FIB':
                    if user_ans.lower() == correct_ans.lower():
                        is_correct = True
                elif q_type == 'DESCRIPTIVE':
                    if len(user_ans) >= 10:
                        is_correct = True
                        
            if is_correct:
                correct_count += 1
                total_correct += 1
            total_questions += 1

            ans = models.AssessmentAnswer(
                assessment_id=assessment.assessment_id,
                question_id=ans_data.question_id,
                selected_option=ans_data.selected_option,
                is_correct=is_correct,
                response_time=ans_data.response_time,
                is_skipped=ans_data.is_skipped
            )
            db.add(ans)
            
        assessment.score = (correct_count / len(answer_pairs) * 100) if answer_pairs else 0
        db.commit()
        db.refresh(assessment)
        created_assessments.append(assessment)

    # Check if any topic score is < 50% and schedule remedial study sessions
    low_performing_topics = []
    from backend.planning.remedial import schedule_extra_remedial_session
    from backend.syllabus.models import Topic as SyllabusTopic
    
    for assessment in created_assessments:
        if assessment.score < 50.0:
            topic = db.query(SyllabusTopic).filter(SyllabusTopic.topic_id == assessment.topic_id).first()
            topic_name = topic.topic_name if topic else f"Topic #{assessment.topic_id}"
            low_performing_topics.append(topic_name)
            try:
                schedule_extra_remedial_session(db, current_user.student_id, assessment.topic_id)
            except Exception as e:
                print(f"Error scheduling remedial session: {e}")

    overall_score = (total_correct / total_questions * 100) if total_questions > 0 else 0
    
    alert_msg = None
    if low_performing_topics:
        topics_str = ", ".join(low_performing_topics)
        alert_msg = f"You performed poorly (< 50% score) on the following topic(s): {topics_str}. An extra remedial study session has been added to your timetable for review."

    try:
        from backend.core.exporter import export_db_to_csv
        export_db_to_csv(db)
    except Exception as e:
        print(f"Error exporting data on assessment submit: {e}")

    if created_assessments:
        res_obj = created_assessments[0]
        res_obj.score = overall_score
        res_obj.performance_alert = alert_msg
        return res_obj
    else:
        fallback = models.Assessment(
            student_id=current_user.student_id,
            topic_id=data.topic_id or 1,
            score=0.0
        )
        db.add(fallback)
        db.commit()
        db.refresh(fallback)
        fallback.performance_alert = alert_msg
        return fallback

@router.post("/summary/{topic_id}", response_model=schemas.SummaryResponse)
def generate_summary(
    topic_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    try:
        summary_text = summary_generator.generate_summary(topic.topic_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"topic_name": topic.topic_name, "summary": summary_text}

@router.post("/flashcards/{topic_id}", response_model=schemas.FlashcardResponse)
def generate_flashcards(
    topic_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    try:
        cards = flashcard_generator.generate_flashcards(topic.topic_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"topic_name": topic.topic_name, "flashcards": cards}

@router.post("/hints/{topic_id}", response_model=schemas.HintResponse)
def generate_hints(
    topic_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    try:
        hints = hint_generator.generate_hints(topic.topic_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"topic_name": topic.topic_name, "hints": hints}

@router.post("/explanation/{topic_id}", response_model=schemas.ExplanationResponse)
def generate_explanation(
    topic_id: int,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    try:
        explanation_text = explanation_generator.generate_explanation(topic.topic_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"topic_name": topic.topic_name, "explanation": explanation_text}

@router.post("/mocktest", response_model=schemas.MockTestResponse)
def generate_mock_test(
    data: schemas.MockTestRequest,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject = db.query(Subject).filter(
        Subject.subject_id == data.subject_id,
        Subject.student_id == current_user.student_id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    topic_names = [t.topic_name for t in subject.topics]
    if not topic_names:
        raise HTTPException(status_code=400, detail="No topics found for this subject. Add topics first.")
    
    try:
        questions = mocktest_generator.generate_mocktest(topic_names, data.num_questions or 10)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": f"Mock test generated with {len(questions)} questions", "questions": questions}

@router.post("/study-strategy", response_model=schemas.StudyStrategyResponse)
def generate_study_strategy_route(
    data: schemas.StudyStrategyRequest,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    subject = db.query(Subject).filter(
        Subject.subject_id == data.subject_id,
        Subject.student_id == current_user.student_id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    topic_names = [t.topic_name for t in subject.topics]
    if not topic_names:
        raise HTTPException(status_code=400, detail="No topics found. Add topics first.")
    
    try:
        strategy = study_strategy.generate_study_strategy(topic_names, data.days_until_exam, data.hours_per_day or 3.0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return strategy

@router.post("/wellness", response_model=schemas.WellnessResponse)
def generate_wellness_tip(
    data: schemas.WellnessRequest,
    current_user: Student = Depends(auth.get_current_user),
):
    try:
        tip = wellness.generate_wellness_tip(data.study_hours_today or 0, data.days_until_exam or 7)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return tip

