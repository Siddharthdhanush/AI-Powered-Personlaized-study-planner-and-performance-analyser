# Volume II - Engineering Appendix

## Section A - UML Modeling

## Document 4 - Class Diagram Engineering Specification

### Purpose

This document defines the object-oriented design of the Adaptive AI Exam Preparation and Performance Analytics System. It identifies the core classes, their attributes, methods, relationships and responsibilities. The class model serves as the blueprint for backend implementation.

| Class           | Important Attributes                 | Major Methods                             | Responsibility                   |
| --------------- | ------------------------------------ | ----------------------------------------- | -------------------------------- |
| Student         | student_id, name, email, daily_hours | login(), updateProfile(), viewDashboard() | Manage student profile           |
| Subject         | subject_id, name                     | addTopic(), getTopics()                   | Manage subjects                  |
| Topic           | topic_id, title, difficulty          | calculatePriority()                       | Manage topics                    |
| StudyPlan       | plan_id, start_date, end_date        | generate(), update()                      | Manage timetable                 |
| StudySession    | session_id, duration                 | start(), pause(), complete()              | Manage study sessions            |
| Question        | question_id, difficulty, type        | generate(), validate()                    | Represent AI-generated questions |
| Assessment      | assessment_id, score                 | startQuiz(), evaluate()                   | Conduct assessments              |
| Performance     | accuracy, response_time, mastery     | updateMetrics()                           | Store analytics                  |
| Prediction      | readiness, priority_score            | predictReadiness()                        | Store ML predictions             |
| RevisionHistory | revision_date, efficiency            | recordRevision()                          | Track revisions                  |
| Dashboard       | charts, reports                      | displayAnalytics()                        | Display insights                 |

### Relationships

Association:  
Student → Subject  
Subject → Topic  
StudyPlan → StudySession  
<br/>Composition:  
Assessment contains multiple Questions.  
StudySession contains Assessments.  
<br/>Aggregation:  
Dashboard aggregates Performance and Prediction.  
<br/>Dependency:  
StudyPlan depends on Prediction.  
Prediction depends on Performance.

### Multiplicity

Student (1) -- (\*) Subject  
Subject (1) -- (\*) Topic  
Topic (1) -- (\*) Question  
Student (1) -- (\*) StudySession  
StudySession (1) -- (\*) Assessment  
Assessment (1) -- (\*) Question  
Student (1) -- (\*) RevisionHistory

### PlantUML Draft

@startuml  
class Student  
class Subject  
class Topic  
class StudyPlan  
class StudySession  
class Question  
class Assessment  
class Performance  
class Prediction  
class RevisionHistory  
class Dashboard  
<br/>Student "1" -- "\*" Subject  
Subject "1" -- "\*" Topic  
Student "1" -- "\*" StudySession  
StudySession "1" \*-- "\*" Assessment  
Assessment "1" \*-- "\*" Question  
Performance --> Prediction  
Dashboard o-- Performance  
Dashboard o-- Prediction  
@enduml

### Design Decisions

• Classes follow the Single Responsibility Principle.  
• Prediction is separated from Performance to preserve historical analytics.  
• StudyPlan is independent so multiple timetable algorithms can be supported.  
• Dashboard is presentation-only and performs no business logic.

### Traceability

Maps directly to:  
• Database tables (Volume I Chapter 5)  
• Backend services  
• REST APIs  
• Future Python classes in FastAPI implementation.