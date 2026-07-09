import os
import csv
from sqlalchemy.orm import Session

# Import models to query tables
from backend.user.models import Student
from backend.syllabus.models import Subject, Topic
from backend.planning.models import StudyPlan
from backend.ai.models import Assessment, AssessmentAnswer
from backend.ml.models import MLPrediction

def export_db_to_csv(db: Session):
    """
    Exports all main SQLite tables into individual CSV files inside backend/data/
    so that evaluators can inspect the raw data locally.
    """
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(data_dir, exist_ok=True)
    
    # 1. Export Students
    students = db.query(Student).all()
    student_file = os.path.join(data_dir, "students.csv")
    with open(student_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["student_id", "name", "email", "password_hash", "created_at"])
        for s in students:
            writer.writerow([s.student_id, s.name, s.email, s.password_hash, s.created_at])

    # 2. Export Syllabus (Subjects & Topics)
    subjects = db.query(Subject).all()
    syllabus_file = os.path.join(data_dir, "syllabus.csv")
    with open(syllabus_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["subject_id", "student_id", "subject_name", "topic_id", "topic_name", "difficulty_weight", "estimated_hours"])
        for sub in subjects:
            for t in sub.topics:
                writer.writerow([sub.subject_id, sub.student_id, sub.subject_name, t.topic_id, t.topic_name, t.difficulty_weight, t.estimated_hours])

    # 3. Export Timetable / Study Plans
    plans = db.query(StudyPlan).all()
    timetable_file = os.path.join(data_dir, "timetable.csv")
    with open(timetable_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["plan_id", "student_id", "topic_id", "planned_date", "planned_minutes", "start_time", "end_time", "is_completed", "is_remedial"])
        for p in plans:
            writer.writerow([p.plan_id, p.student_id, p.topic_id, p.planned_date, p.planned_minutes, p.start_time, p.end_time, p.is_completed, p.is_remedial])

    # 4. Export Assessments
    assessments = db.query(Assessment).all()
    assessments_file = os.path.join(data_dir, "assessments.csv")
    with open(assessments_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["assessment_id", "student_id", "topic_id", "attempt_date", "score"])
        for a in assessments:
            writer.writerow([a.assessment_id, a.student_id, a.topic_id, a.attempt_date, a.score])

    # 5. Export Assessment Answers
    answers = db.query(AssessmentAnswer).all()
    answers_file = os.path.join(data_dir, "assessment_answers.csv")
    with open(answers_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["answer_id", "assessment_id", "question_id", "selected_option", "is_correct", "response_time", "is_skipped"])
        for ans in answers:
            writer.writerow([ans.answer_id, ans.assessment_id, ans.question_id, ans.selected_option, ans.is_correct, ans.response_time, ans.is_skipped])

    # 6. Export ML Predictions
    preds = db.query(MLPrediction).all()
    predictions_file = os.path.join(data_dir, "ml_predictions.csv")
    with open(predictions_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["prediction_id", "student_id", "mcq_accuracy", "avg_response_time", "skip_count", "topic_mastery", "exam_readiness_prob", "timestamp"])
        for p in preds:
            writer.writerow([p.prediction_id, p.student_id, p.mcq_accuracy, p.avg_response_time, p.skip_count, p.topic_mastery, p.exam_readiness_prob, p.timestamp])

    # 7. Export Difficulty Performance Metrics (Accuracy per Easy, Medium, Hard level)
    from backend.ai.models import Question
    diff_file = os.path.join(data_dir, "difficulty_performance.csv")
    with open(diff_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["student_id", "easy_accuracy", "medium_accuracy", "hard_accuracy", "easy_count", "medium_count", "hard_count"])
        for s in students:
            # Query all answers for this student
            s_answers = db.query(AssessmentAnswer).join(Assessment).join(Question, AssessmentAnswer.question_id == Question.question_id).filter(
                Assessment.student_id == s.student_id
            ).all()
            
            easy_total = easy_correct = 0
            med_total = med_correct = 0
            hard_total = hard_correct = 0
            
            for ans in s_answers:
                diff = (ans.question.difficulty or "Medium").lower()
                if diff == "easy":
                    easy_total += 1
                    if ans.is_correct:
                        easy_correct += 1
                elif diff == "hard":
                    hard_total += 1
                    if ans.is_correct:
                        hard_correct += 1
                else:
                    med_total += 1
                    if ans.is_correct:
                        med_correct += 1
            
            easy_acc = round((easy_correct / easy_total) * 100, 2) if easy_total > 0 else 0.0
            med_acc = round((med_correct / med_total) * 100, 2) if med_total > 0 else 0.0
            hard_acc = round((hard_correct / hard_total) * 100, 2) if hard_total > 0 else 0.0
            
            writer.writerow([s.student_id, easy_acc, med_acc, hard_acc, easy_total, med_total, hard_total])

    # 8. Export Weak Topics List (Topic ID, name, latest assessment score under 60%)
    from backend.syllabus.models import Topic as SyllabusTopic
    weak_file = os.path.join(data_dir, "weak_topics.csv")
    with open(weak_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["student_id", "topic_id", "topic_name", "latest_score"])
        for s in students:
            # Find the latest score for each topic
            latest_scores = {}
            for a in db.query(Assessment).filter(Assessment.student_id == s.student_id).all():
                if a.topic_id not in latest_scores or a.attempt_date > latest_scores[a.topic_id]["date"]:
                    latest_scores[a.topic_id] = {"score": a.score, "date": a.attempt_date}
            
            for topic_id, score_data in latest_scores.items():
                if score_data["score"] < 60.0:
                    topic = db.query(SyllabusTopic).filter(SyllabusTopic.topic_id == topic_id).first()
                    topic_name = topic.topic_name if topic else f"Topic #{topic_id}"
                    writer.writerow([s.student_id, topic_id, topic_name, round(score_data["score"], 2)])

    print("Successfully exported SQLite tables to CSV in backend/data/ folder.")
