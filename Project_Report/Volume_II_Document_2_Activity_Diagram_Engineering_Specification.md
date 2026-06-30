# Volume II - Engineering Appendix

## Section A - UML Modeling

## Document 2 - Activity Diagram Engineering Specification

### Purpose

This document defines the Activity Diagram for the Adaptive AI Exam Preparation and Performance Analytics System. The objective is to model the complete workflow followed by the student and the internal system from the moment a syllabus is uploaded until the student is declared exam-ready. This diagram will be the basis for workflow implementation in the backend.

### Scope

The activity model covers:  
• Student authentication  
• Syllabus upload  
• Topic extraction  
• Exam schedule configuration  
• Timetable generation  
• Study session execution  
• AI-generated assessment  
• ML-based performance analysis  
• Adaptive timetable regeneration  
• Dashboard updates  
• Continuous learning loop until examination.

### Primary Workflow

- Step 1: Start
- Step 2: Student Login / Registration
- Step 3: Upload Syllabus (PDF/Text)
- Step 4: Extract Subjects and Topics
- Step 5: Enter Exam Dates and Daily Study Hours
- Step 6: Generate Initial Adaptive Timetable
- Step 7: Display Today's Study Plan
- Step 8: Begin Study Session
- Step 9: Learning Optimization Engine recommends strategy and break schedule
- Step 10: Generate AI Questions using Ollama
- Step 11: Student attempts MCQ and Descriptive Questions
- Step 12: Record response time, confidence, hints used and skipped questions
- Step 13: Evaluate answers
- Step 14: Machine Learning predicts Topic Mastery, Revision Efficiency and Exam Readiness
- Step 15: Adaptive Timetable Engine updates future schedule
- Step 16: Dashboard refreshes analytics
- Step 17: More topics remaining? If Yes → Repeat Study Cycle
- Step 18: If No → Final Readiness Report
- Step 19: End

### Decision Nodes

Decision D1: Is the syllabus valid?  
Decision D2: Are exam dates available?  
Decision D3: Has today's study target been completed?  
Decision D4: Is Topic Mastery below threshold?  
Decision D5: Is Exam Readiness above target?  
Decision D6: Has the student reached the examination date?

### Swimlane Definition

Lane 1 : Student  
Lane 2 : Frontend  
Lane 3 : Backend  
Lane 4 : AI Engine (Ollama)  
Lane 5 : Assessment Engine  
Lane 6 : Machine Learning Engine  
Lane 7 : Adaptive Timetable Engine  
Lane 8 : Database  
Lane 9 : Dashboard

### PlantUML Activity Diagram Draft

@startuml  
start  
:Login;  
:Upload Syllabus;  
:Extract Topics;  
:Enter Exam Dates;  
:Generate Timetable;  
repeat  
:Study Session;  
:Generate AI Questions;  
:Attempt Assessment;  
:ML Prediction;  
:Update Timetable;  
repeat while (More Topics?)  
:Generate Final Report;  
stop  
@enduml

| Failure Scenario       | System Action           | Recovery               |
| ---------------------- | ----------------------- | ---------------------- |
| Invalid syllabus       | Request correction      | Manual topic entry     |
| Ollama unavailable     | Pause generation        | Retry when available   |
| Assessment interrupted | Autosave session        | Resume later           |
| Low readiness          | Schedule extra revision | Re-evaluate after quiz |

### Traceability

Related Volume I Chapters:  
• Overall System Architecture  
• AI Pipeline  
• ML Pipeline  
• Adaptive Timetable Optimization  
• Assessment Engine

### Next Engineering Document

Document 3 - Sequence Diagram Engineering Specification will describe the detailed interaction between Student, Frontend, Backend, AI Engine, ML Engine, Database and Dashboard for every major operation.