# Master Project Design Specification

## Adaptive AI Exam Preparation and Performance Analytics System

## Chapter 4 - Overall System Architecture

### 4.1 Purpose

This chapter defines the complete software architecture of the proposed system. It explains how every module communicates, the responsibilities of each component, the data exchanged between modules, and the complete end-to-end workflow from syllabus upload to adaptive timetable generation.

### 4.2 Architectural Style

The proposed system follows a modular layered architecture. Each layer has a well-defined responsibility and communicates through clearly defined interfaces. This separation allows independent development, testing, replacement and future scalability.  
<br/>Layers:  
1\. Presentation Layer (Web UI)  
2\. Application Layer (Business Logic)  
3\. AI Layer (Ollama)  
4\. Machine Learning Layer  
5\. Data Layer (SQLite)  
6\. Analytics & Dashboard Layer

### 4.3 High-Level Architecture

Student  
│  
▼  
Web Dashboard  
│  
▼  
Backend Controller  
│  
┌─┼──────────────────────────────────────┐  
▼ ▼ ▼  
Planning Engine Assessment Engine  
│ │  
▼ ▼  
AI Question Engine (Ollama) Performance Collector  
│ │  
└──────────────┬────────────────────┘  
▼  
Machine Learning Engine  
│  
▼  
Adaptive Timetable Engine  
│  
▼  
Dashboard & Database

### 4.4 Module Responsibilities

| Module            | Purpose                   | Input               | Output              |
| ----------------- | ------------------------- | ------------------- | ------------------- |
| User Interface    | Collect user actions      | Forms               | Requests            |
| Syllabus Module   | Extract subjects/topics   | PDF/Text            | Structured syllabus |
| Planning Engine   | Initial study plan        | Topics, exam dates  | Timetable           |
| AI Engine         | Generate questions        | Topic,difficulty    | Questions           |
| Assessment Engine | Conduct quizzes           | Questions, answers  | Performance metrics |
| ML Engine         | Predict mastery/readiness | Performance history | Predictions         |
| Adaptive Engine   | Replan timetable          | Predictions         | Updated timetable   |
| Dashboard         | Visualize analytics       | DB records          | Charts & insights   |
| Database          | Persistent storage        | All modules         | Stored records      |

### 4.5 End-to-End Workflow

Step 1: Student uploads syllabus PDF or manually enters subjects and topics.

Step 2: System extracts topics and stores them in the syllabus database.

Step 3: Student enters examination dates and daily available study hours.

Step 4: Planning Engine computes topic priorities and generates an initial timetable.

Step 5: Student begins scheduled learning sessions.

Step 6: AI Engine (Ollama) generates Easy, Moderate and Hard questions dynamically for the selected topic.

Step 7: Assessment Engine presents MCQs and descriptive questions while recording response time, skips and retries.

Step 8: Performance Collector stores accuracy, response time, confidence and revision behaviour.

Step 9: Machine Learning Engine computes Topic Mastery, Revision Efficiency and Exam Readiness.

Step 10: Adaptive Timetable Engine reallocates future study time according to updated predictions.

Step 11: Dashboard refreshes analytics and recommendations.

Step 12: The cycle repeats until the examination date.

### 4.6 Data Flow Between Modules

| Source          | Data               | Destination     | Purpose                |
| --------------- | ------------------ | --------------- | ---------------------- |
| Student         | Syllabus           | Syllabus Module | Topic extraction       |
| Planner         | Topic + Difficulty | AI Engine       | Question generation    |
| Assessment      | Responses          | ML Engine       | Performance prediction |
| ML Engine       | Scores             | Adaptive Engine | Replanning             |
| Adaptive Engine | Updated schedule   | Dashboard       | Display                |

### 4.7 Internal Communication

The Planning Engine never communicates directly with Ollama. All AI requests pass through the AI Engine. Similarly, the Dashboard never performs calculations itself; it only visualizes processed data obtained from the ML Engine and database. This separation reduces coupling and improves maintainability.

### 4.8 Failure Handling

| Scenario           | System Action      | Recovery                 |
| ------------------ | ------------------ | ------------------------ |
| Ollama unavailable | Fallback message   | Retry after model starts |
| PDF parsing fails  | Ask manual entry   | Continue workflow        |
| Quiz interrupted   | Auto-save progress | Resume later             |
| Database error     | Log & notify       | Restore backup           |

### 4.9 Scalability Considerations

The architecture supports future additions such as faculty dashboards, multiple users, cloud deployment, additional LLMs, mobile applications and advanced ML models without redesigning existing modules because each component has a single well-defined responsibility.

### 4.10 Design Decisions

• Layered modular architecture chosen for maintainability.  
• AI and ML separated to clearly distinguish content generation from prediction.  
• Database centralized for consistent analytics.  
• Adaptive engine isolated so scheduling strategies can evolve independently.  
• Local Ollama selected to avoid recurring API costs and preserve privacy.

### 4.11 Chapter Summary

This chapter establishes the complete software architecture and interaction between all major components. The following chapter will design the database schema, entities, relationships and storage strategy supporting this architecture.