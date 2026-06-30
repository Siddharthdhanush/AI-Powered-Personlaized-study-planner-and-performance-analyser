# Volume II - Engineering Appendix

## Section A - UML Modeling

## Document 7 - State Diagram Engineering Specification

### Purpose

This document defines the state model for the Adaptive AI Exam Preparation and Performance Analytics System. It describes how a student, study session and adaptive learning process transition between different states during the complete exam preparation lifecycle.

### Scope

The state model covers:  
• Student lifecycle  
• Study session lifecycle  
• Assessment lifecycle  
• Timetable lifecycle  
• Exam readiness lifecycle

| State                | Entry Condition              | Exit Condition         | Next State           |
| -------------------- | ---------------------------- | ---------------------- | -------------------- |
| Registered           | Account created              | Successful login       | Logged In            |
| Logged In            | Authentication success       | Upload syllabus        | Syllabus Uploaded    |
| Syllabus Uploaded    | Topics extracted             | Exam schedule entered  | Planning             |
| Planning             | Inputs available             | Timetable generated    | Ready to Study       |
| Ready to Study       | Schedule displayed           | Start session          | Studying             |
| Studying             | Study session begins         | Quiz starts            | Assessment           |
| Assessment           | Questions presented          | Evaluation complete    | Performance Analysis |
| Performance Analysis | Scores computed              | ML prediction          | Adaptive Planning    |
| Adaptive Planning    | Timetable updated            | Next session published | Ready to Study       |
| Exam Ready           | Readiness threshold achieved | Exam date reached      | Exam Completed       |
| Exam Completed       | Exam finished                | Archive progress       | Completed            |

### State Transition Rules

1\. A student cannot enter the Planning state until a valid syllabus and exam schedule are available.  
2\. Assessment can only begin after a study session starts.  
3\. Performance Analysis always follows Assessment.  
4\. Adaptive Planning is triggered after every completed assessment.  
5\. The system loops between Ready to Study → Studying → Assessment → Performance Analysis → Adaptive Planning until the target readiness level or examination date is reached.

### Exceptional States

• Session Paused  
• Session Interrupted  
• AI Service Unavailable  
• Database Connection Lost  
• Assessment Timeout  
• Manual Timetable Override  
<br/>Each exceptional state contains a recovery path allowing the student to resume without losing progress.

### PlantUML Draft

@startuml  
\[\*\] --> Registered  
Registered --> LoggedIn  
LoggedIn --> SyllabusUploaded  
SyllabusUploaded --> Planning  
Planning --> ReadyToStudy  
ReadyToStudy --> Studying  
Studying --> Assessment  
Assessment --> PerformanceAnalysis  
PerformanceAnalysis --> AdaptivePlanning  
AdaptivePlanning --> ReadyToStudy  
ReadyToStudy --> ExamReady  
ExamReady --> ExamCompleted  
ExamCompleted --> \[\*\]  
@enduml

### Design Decisions

• A finite-state model simplifies implementation.  
• Adaptive Planning is an independent state rather than a background task.  
• Recovery states ensure robustness during interruptions.  
• State transitions directly support backend workflow and testing.

### Traceability

Derived from:  
• Use Case Diagram  
• Activity Diagram  
• Sequence Diagram  
• Component Diagram  
• Deployment Diagram  
<br/>Supports:  
• Backend workflow implementation  
• Integration testing  
• State management in the frontend  
• Adaptive learning engine