# Master Project Design Specification

## Adaptive AI Exam Preparation and Performance Analytics System

## Chapter 3 - System Requirements & Requirement Analysis

### 3.1 Purpose

This chapter defines all functional, non-functional, hardware, software, data, AI and ML requirements of the proposed system. It establishes the foundation for the architecture and implementation described in later chapters.

### 3.2 Stakeholders

| Stakeholder        | Responsibilities          | Inputs                        | Expected Outputs            |
| ------------------ | ------------------------- | ----------------------------- | --------------------------- |
| Student            | Uses complete platform    | Syllabus, exam dates, answers | Study plan, analytics       |
| AI Engine (Ollama) | Generate learning content | Topic, difficulty, prompt     | Questions, hints, summaries |
| ML Engine          | Analyse performance       | Assessment metrics            | Predictions & scores        |
| System             | Coordinate modules        | All module outputs            | Adaptive timetable          |

### 3.3 Functional Requirements

| ID   | Requirement                                                                      |
| ---- | -------------------------------------------------------------------------------- |
| FR1  | Accept syllabus PDF or manual syllabus.                                          |
| FR2  | Extract subjects and topics.                                                     |
| FR3  | Accept examination dates.                                                        |
| FR4  | Calculate remaining preparation days.                                            |
| FR5  | Generate optimized initial timetable.                                            |
| FR6  | Generate dynamic Easy/Moderate/Hard MCQs and descriptive questions using Ollama. |
| FR7  | Measure response time for every question.                                        |
| FR8  | Support Skip and Mark-for-Later.                                                 |
| FR9  | Evaluate MCQ and descriptive answers.                                            |
| FR10 | Compute Topic Mastery, Revision Efficiency, Forgetting Index and Exam Readiness. |
| FR11 | Continuously adapt timetable after each assessment.                              |
| FR12 | Display dashboard analytics.                                                     |

### 3.4 Non-Functional Requirements

| Category        | Requirement                             | Justification              |
| --------------- | --------------------------------------- | -------------------------- |
| Performance     | Dashboard should load quickly           | Good user experience       |
| Scalability     | Support additional subjects and courses | Future expansion           |
| Reliability     | Assessment data must not be lost        | Performance tracking       |
| Usability       | Simple interface for students           | Easy adoption              |
| Maintainability | Modular architecture                    | Easy upgrades              |
| Privacy         | Run LLM locally using Ollama            | Student data remains local |

### 3.5 Hardware Requirements

| Component | Minimum         | Recommended     |
| --------- | --------------- | --------------- |
| CPU       | Intel i5/Ryzen5 | Intel i7/Ryzen7 |
| RAM       | 8 GB            | 16 GB           |
| Storage   | 20 GB Free      | 50 GB SSD       |
| GPU       | Optional        | Optional        |
| Internet  | Setup only      | Broadband       |

### 3.6 Software Requirements

| Software           | Purpose          | Reason                |
| ------------------ | ---------------- | --------------------- |
| Python             | Backend & ML     | Large ecosystem       |
| FastAPI            | REST Backend     | Fast and lightweight  |
| React              | Frontend         | Interactive UI        |
| SQLite             | Database         | Simple MVP            |
| Ollama             | Local LLM        | Offline AI            |
| Scikit-learn       | Machine Learning | Decision Tree, NB, LR |
| PyMuPDF/pdfplumber | PDF Parsing      | Syllabus extraction   |

### 3.7 Data Requirements

The system stores student profile information, syllabus hierarchy, timetable schedules, assessment attempts, generated questions, quiz responses, response time, skip behaviour, revision history, ML feature vectors and prediction results. Every assessment updates the student's learning profile rather than replacing previous records.

### 3.8 AI Requirements

The AI engine shall generate questions, explanations, summaries, hints, flashcards and revision notes. The AI output must vary by topic and difficulty while remaining aligned with the uploaded syllabus.

### 3.9 ML Requirements

The ML engine shall estimate Topic Mastery, Exam Readiness and Revision Efficiency using assessment behaviour including accuracy, response time, skip frequency, confidence, revision count and historical improvement.

### 3.10 Input-Process-Output Model

| Input                | Processing      | Output              |
| -------------------- | --------------- | ------------------- |
| Syllabus, exam dates | Planning Engine | Optimized timetable |
| Topic                | Ollama          | Dynamic questions   |
| Student answers      | Assessment + ML | Topic scores        |
| Performance history  | Adaptive Engine | Updated timetable   |

### 3.11 Assumptions

Students provide valid syllabus information, answer assessments sincerely and allocate realistic study hours. Ollama is installed and at least one supported local model is available.

### 3.12 Constraints

The first version targets English-language academic content. Question quality depends on the selected LLM. Large models require higher RAM. Initial deployment targets single-user usage.

### 3.13 Design Decisions

1\. Local AI instead of cloud APIs.  
2\. Modular architecture.  
3\. Adaptive timetable rather than static planning.  
4\. Behaviour-aware analytics using response time, skips and revision efficiency.  
5\. Separation of AI content generation and ML prediction.

### 3.14 Chapter Summary

This chapter specifies the complete requirement baseline for the project. The next chapter will transform these requirements into the overall software architecture showing how every module communicates and how information flows throughout the system.