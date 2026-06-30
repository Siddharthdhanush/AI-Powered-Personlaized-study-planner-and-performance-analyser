Volume II - Engineering Appendix

# Section B - Data Flow Modeling

## Purpose

Section B defines how information flows through the Adaptive AI Exam Preparation and Performance Analytics System. It documents the Context Diagram, DFD Level 0, DFD Level 1 and DFD Level 2. Together these diagrams describe external entities, internal processes, data stores and data movement. They provide the bridge between UML design and implementation.

## Document 8 - Context Diagram Engineering Specification

The Context Diagram represents the complete application as a single process interacting with external entities.

| External Entity | Data Sent                                  | Data Received                 |
| --------------- | ------------------------------------------ | ----------------------------- |
| Student         | Syllabus, Exam Dates, Answers, Preferences | Timetable, Questions, Reports |
| Administrator   | Configuration                              | Analytics                     |
| Ollama          | Question Request                           | Generated Questions           |
| ML Engine       | Assessment Features                        | Predictions                   |
| Database        | Read/Write Requests                        | Stored Records                |

Main Process: Adaptive AI Exam Preparation and Performance Analytics System.

## Document 9 - DFD Level 0 Engineering Specification

Level 0 decomposes the system into major functional processes.

| Process                | Input              | Output             | Data Store    |
| ---------------------- | ------------------ | ------------------ | ------------- |
| P1 User Management     | Login Details      | Authenticated User | Student DB    |
| P2 Syllabus Processing | PDF/Text           | Topics             | Syllabus DB   |
| P3 Timetable Planning  | Topics, Exam Dates | Study Plan         | Planning DB   |
| P4 Assessment          | Student Answers    | Scores             | Assessment DB |
| P5 AI Generation       | Topics             | Questions/Hints    | Question DB   |
| P6 ML Analytics        | Assessment Metrics | Predictions        | Analytics DB  |
| P7 Dashboard           | Predictions        | Charts & Reports   | Analytics DB  |

## Document 10 - DFD Level 1 Engineering Specification

Level 1 expands the core planning and assessment processes.

Planning Process:  
Receive syllabus → Extract subjects → Extract topics → Calculate available study days → Compute priority scores → Allocate study hours → Insert revision sessions → Publish timetable.  
<br/>Assessment Process:  
Generate AI questions → Present questions → Collect answers → Evaluate responses → Store metrics → Invoke ML prediction → Update timetable.

## Document 11 - DFD Level 2 Engineering Specification

Level 2 provides detailed decomposition of the Adaptive Timetable and Learning Optimization engines.

| Subprocess           | Function               | Output              |
| -------------------- | ---------------------- | ------------------- |
| Priority Calculator  | Compute topic priority | Priority Score      |
| Hour Allocator       | Distribute study hours | Daily Schedule      |
| Break Planner        | Insert wellness breaks | Optimized Sessions  |
| Question Generator   | Call Ollama            | Dynamic Questions   |
| Performance Analyzer | Compute metrics        | Feature Vector      |
| Prediction Engine    | Run ML models          | Mastery & Readiness |
| Adaptive Planner     | Regenerate schedule    | Updated Timetable   |
| Dashboard Updater    | Refresh analytics      | Visual Reports      |

## Data Stores

D1 Student Database  
D2 Syllabus Repository  
D3 Question Repository  
D4 Assessment Repository  
D5 Performance Repository  
D6 Prediction Repository  
D7 Timetable Repository

## Data Dictionary

Student Profile, Subject, Topic, Exam Schedule, Study Session, Question, Answer, Response Time, Confidence Score, Topic Mastery, Revision Efficiency, Forgetting Index, Exam Readiness, Timetable and Dashboard Report are the primary logical data objects exchanged among processes.

## Traceability

This section supports:  
• Volume I Architecture  
• Database Design  
• API Design  
• Backend Services  
• Class Diagram  
• Component Diagram  
• Future Implementation