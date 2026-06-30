# Volume II - Engineering Appendix

## Section A - UML Modeling

## Document 3 - Sequence Diagram Engineering Specification

### Purpose

This document defines the Sequence Diagram for the Adaptive AI Exam Preparation and Performance Analytics System. It models the chronological interaction between the Student, Frontend, Backend, Database, Ollama AI Engine, Machine Learning Engine and Adaptive Timetable Engine for the major use cases. The sequence diagram serves as the implementation blueprint for API communication and module integration.

### Participating Objects

1\. Student  
2\. Web Frontend  
3\. Backend API  
4\. Authentication Service  
5\. Database  
6\. Ollama AI Engine  
7\. Assessment Engine  
8\. Machine Learning Engine  
9\. Adaptive Timetable Engine  
10\. Dashboard Service

### Primary Scenario - End-to-End Learning Session

| Step | Actor/Object      | Interaction                         |
| ---- | ----------------- | ----------------------------------- |
| 1    | Student           | Login request                       |
| 2    | Frontend          | Send authentication request         |
| 3    | Backend           | Validate credentials                |
| 4    | Database          | Return user profile                 |
| 5    | Backend           | Return dashboard                    |
| 6    | Student           | Upload syllabus                     |
| 7    | Backend           | Extract and store topics            |
| 8    | Student           | Enter exam dates                    |
| 9    | Backend           | Generate initial timetable          |
| 10   | Student           | Start study session                 |
| 11   | Backend           | Request questions from Ollama       |
| 12   | Ollama            | Return MCQs & descriptive questions |
| 13   | Assessment Engine | Present questions                   |
| 14   | Student           | Submit answers                      |
| 15   | Assessment Engine | Evaluate responses                  |
| 16   | ML Engine         | Predict mastery & readiness         |
| 17   | Adaptive Engine   | Update future timetable             |
| 18   | Database          | Store all analytics                 |
| 19   | Dashboard         | Display updated progress            |

### Sequence Flow Description

The sequence begins with authentication. After successful login, the student uploads the syllabus and exam schedule. The backend extracts topics, generates the initial timetable and starts a study session. During the session the backend communicates with Ollama to obtain dynamic questions. Student responses are evaluated and forwarded to the Machine Learning Engine. The prediction results are consumed by the Adaptive Timetable Engine, which recalculates future study sessions. Finally, the updated analytics are stored and presented on the dashboard.

### PlantUML Draft

@startuml  
actor Student  
participant Frontend  
participant Backend  
database Database  
participant Ollama  
participant ML  
participant Planner  
Student -> Frontend : Login  
Frontend -> Backend : Authenticate  
Backend -> Database : Verify User  
Database --> Backend : Profile  
Student -> Frontend : Upload Syllabus  
Frontend -> Backend : Upload Data  
Backend -> Ollama : Generate Questions  
Ollama --> Backend : Questions  
Student -> Backend : Submit Answers  
Backend -> ML : Predict Performance  
ML --> Backend : Scores  
Backend -> Planner : Update Timetable  
Planner --> Backend : New Plan  
Backend -> Database : Save Results  
Backend --> Frontend : Dashboard Update  
@enduml

### API Mapping

Authentication API → Login  
Syllabus API → Upload & Topic Extraction  
Planner API → Generate Timetable  
AI API → Generate Questions  
Assessment API → Submit Answers  
ML API → Predict Performance  
Dashboard API → Fetch Analytics

| Failure Point        | Impact               | Recovery                 |
| -------------------- | -------------------- | ------------------------ |
| Authentication fails | Access denied        | Retry login              |
| Ollama unavailable   | No questions         | Retry / cached questions |
| Database unavailable | Cannot save progress | Queue transaction        |
| ML prediction fails  | No adaptation        | Use previous prediction  |

### Traceability

Derived from:  
• Use Case Engineering Specification  
• Activity Diagram Engineering Specification  
Supports:  
• Backend API implementation  
• Integration testing  
• Component diagram  
• Deployment diagram