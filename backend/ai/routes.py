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
        raw_questions = question_generator.generate_quiz_for_topic(topic.topic_name, num_questions=9)
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
        raw_text = document_parser.parse_document(subject_record.file_path)
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

@router.post("/assessment/submit", response_model=schemas.AssessmentOut)
def submit_assessment(
    data: schemas.AssessmentSubmit,
    current_user: Student = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. Create Assessment
    assessment = models.Assessment(
        student_id=current_user.student_id,
        topic_id=data.topic_id
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # 2. Add Answers & calculate score
    correct_count = 0
    for ans_data in data.answers:
        q = db.query(models.Question).filter(models.Question.question_id == ans_data.question_id).first()
        is_correct = False
        if q and not ans_data.is_skipped and ans_data.selected_option:
            q_type = getattr(q, 'question_type', 'MCQ')
            user_ans = ans_data.selected_option.strip()
            correct_ans = q.correct_option.strip()
            
            if q_type == 'MCQ':
                if user_ans == correct_ans:
                    is_correct = True
            elif q_type == 'MULTI_MCQ':
                u_opts = sorted([o.strip() for o in user_ans.split(",") if o.strip()])
                c_opts = sorted([o.strip() for o in correct_ans.split(",") if o.strip()])
                if u_opts == c_opts:
                    is_correct = True
            elif q_type == 'FIB':
                if user_ans.lower() == correct_ans.lower():
                    is_correct = True
            elif q_type == 'DESCRIPTIVE':
                # Mark as correct if user wrote something meaningful (>10 characters)
                if len(user_ans) >= 10:
                    is_correct = True
                    
        if is_correct:
            correct_count += 1
            
        ans = models.AssessmentAnswer(
            assessment_id=assessment.assessment_id,
            question_id=ans_data.question_id,
            selected_option=ans_data.selected_option,
            is_correct=is_correct,
            response_time=ans_data.response_time,
            is_skipped=ans_data.is_skipped
        )
        db.add(ans)
        
    # Finalize score (percentage)
    total_q = len(data.answers)
    assessment.score = (correct_count / total_q * 100) if total_q > 0 else 0
    db.commit()
    db.refresh(assessment)
    
    return assessment

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

