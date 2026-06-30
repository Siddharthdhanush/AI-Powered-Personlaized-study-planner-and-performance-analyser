## **Master Project Design Specification** 

## **Adaptive AI Exam Preparation and Performance Analytics System** 

## **Chapter 5 – Database Design & Schema** 

## **5.1 Purpose** 

This chapter defines the complete database architecture for the system. It specifies every entity, attribute, relationship, ownership, and data flow required to support planning, assessments, analytics, machine learning and adaptive timetable generation. 

## **5.2 Database Objectives** 

The database must: 

- Store student information. 

- Store syllabus hierarchy. 

- Maintain exam schedules. 

- Store generated questions. 

- Record every assessment attempt. 

- Track response time, skips and revisions. 

- Store ML feature vectors and predictions. 

- Support adaptive timetable regeneration. 

- Preserve complete learning history. 

## **5.3 Database Technology** 

Initial Version: SQLite 

Reason: 

- Lightweight 

- Zero configuration 

- Easy local deployment 

- Sufficient for MVP 

Future: 

- PostgreSQL for multi-user deployment. 

## **5.4 Entity Overview** 

- Student 

- Subject 

- Topic 

- Exam 

- StudyPlan 

- StudySession 

- Question 

- Assessment 

- AssessmentAnswer 

- Performance 

- RevisionHistory 

- Prediction 

- AdaptiveSchedule 

## **5.5 Entity Relationship (Conceptual)** 

Student │ ├── Subjects │ └── Topics │ ├── Questions │ ├── Assessments │ ├── Performance │ └── Revision History │ ├── Study Plan │ 

└── Predictions 

│ 

▼ Adaptive Timetable 

## _**Student Table**_ 

|**_Student Table_**|||
|---|---|---|
|Column|Type|Purpose|
|student_id|INTEGER PK|Unique student|
|name|TEXT|Student name|
|study_hours|REAL|Dailyhours|
|preferred_session|TEXT|Morning/Evening|
|created_at|DATETIME|Registration|



## _**Subject Table**_ 

|**_Subject Table_**|||
|---|---|---|
|Column|Type|Purpose|
|subject_id|INTEGER PK|Subject|
|student_id|FK|Owner|
|subject_name|TEXT|Name|



## _**Topic Table**_ 

|**_Topic Table_**|||
|---|---|---|
|Column|Type|Purpose|
|topic_id|INTEGER PK|Topic|
|subject_id|FK|Parent subject|
|topic_name|TEXT|Topic|
|difficulty_weight|REAL|Initial weight|
|estimated_hours|REAL|Planning|



## _**Exam Table**_ 

|**_Exam Table_**|||
|---|---|---|
|Column|Type|Purpose|
|exam_id|INTEGER PK|Exam|
|subject_id|FK|Related subject|
|exam_date|DATE|Target date|



## _**Question Table**_ 

|**_Queston Table_**|||
|---|---|---|
|Column|Type|Purpose|
|question_id|INTEGER PK|Question|
|topic_id|FK|Topic|
|difficulty|TEXT|Easy/Medium/Hard|
|question_type|TEXT|MCQ/Text|
|generated_by|TEXT|Ollama|



## _**Assessment Table**_ 

|**_Assessment Table_**|||
|---|---|---|
|Column|Type|Purpose|
|assessment_id|INTEGER PK|Quiz|
|student_id|FK|Owner|
|topic_id|FK|Topic|
|attempt_date|DATETIME|Attempt|



## _**AssessmentAnswer Table**_ 

|**_AssessmentAnswer Table_**|||
|---|---|---|
|Column|Type|Purpose|
|answer_id|INTEGER PK|Answer|
|assessment_id|FK|Quiz|
|response_time|REAL|Seconds|
|is_skipped|BOOLEAN|Skip|
|confidence_before|REAL|Self rating|
|confidence_after|REAL|Updated|



## _**Performance Table**_ 

|**_Performance Table_**|||
|---|---|---|
|Column|Type|Purpose|
|performance_id|INTEGER PK|Record|
|topic_id|FK|Topic|
|accuracy|REAL|MCQaccuracy|
|subjective_score|REAL|Text score|
|revision_efficiency|REAL|Learning gain|
|forgetting_index|REAL|Retention estimate|
|topic_mastery|REAL|ML output|



## _**Prediction Table**_ 

|**_Predicton Table_**|||
|---|---|---|
|Column|Type|Purpose|
|prediction_id|INTEGER PK|Prediction|
|exam_readiness|REAL|Probability|
|recommended_hours|REAL|Studyallocation|
|priority_score|REAL|Adaptivepriority|



|Column<br>Type<br>Purpose<br>prediction_id<br>INTEGER PK<br>Prediction<br>exam_readiness<br>REAL<br>Probability<br>recommended_hours<br>REAL<br>Studyallocation<br>priority_score<br>REAL<br>Adaptivepriority|Column<br>Type<br>Purpose<br>prediction_id<br>INTEGER PK<br>Prediction<br>exam_readiness<br>REAL<br>Probability<br>recommended_hours<br>REAL<br>Studyallocation<br>priority_score<br>REAL<br>Adaptivepriority|Column<br>Type<br>Purpose<br>prediction_id<br>INTEGER PK<br>Prediction<br>exam_readiness<br>REAL<br>Probability<br>recommended_hours<br>REAL<br>Studyallocation<br>priority_score<br>REAL<br>Adaptivepriority|
|---|---|---|
|**5.6 Read/Write Responsibility Matrix**|||
|Module|Reads|Writes|
|PlanningEngine|Topic,Exam|StudyPlan|
|AI Engine|Topic|Question|
|Assessment|Question|Assessment,<br>AssessmentAnswer|
|ML Engine|Performance|Prediction|
|Adaptive Engine|Prediction|StudyPlan|
|Dashboard|All|-|



## **5.7 Normalization Strategy** 

The schema follows normalized design to reduce redundancy. Subjects, topics, assessments and predictions are separated into dedicated tables. Foreign keys maintain relationships while allowing independent updates. 

## **5.8 Indexing Strategy** 

Indexes will be created on student_id, topic_id, subject_id, exam_date and assessment_id to speed up dashboard queries and adaptive planning. 

## **5.9 Example Data Flow** 

Student uploads syllabus → Subject and Topic tables populated → Planner creates StudyPlan → Ollama generates Question records → Assessment stores answers → Performance updated → ML writes Prediction → Adaptive Engine updates StudyPlan. 

## **5.10 Design Decisions** 

- Separate Question and Assessment tables to preserve question history. 

- Store behaviour metrics (response time, skips) independently. 

- Prediction results stored rather than overwritten to analyse progress over time. 

- Revision history retained for calculating Revision Efficiency and Forgetting Index. 

## **5.11 Chapter Summary** 

This chapter establishes the persistent data model supporting every module of the system. The next chapter will describe the complete Artificial Intelligence pipeline centred around Ollama, prompt engineering and dynamic content generation. 

