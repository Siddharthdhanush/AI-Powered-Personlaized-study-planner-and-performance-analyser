Volume II - Engineering Appendix

# Section C - Database Engineering

## Purpose

This section defines the engineering specification for the database layer. It documents the Entity Relationship Model, normalization strategy, SQL schema, indexing strategy, relationship mapping, constraints and database design decisions. It serves as the implementation reference for the persistence layer.

## 1\. Database Architecture

The MVP uses SQLite due to its simplicity and offline support. The schema is designed to be fully compatible with PostgreSQL for future deployment without structural redesign.

## 2\. Entity Relationship Model

| Entity          | Primary Key    | Purpose                   |
| --------------- | -------------- | ------------------------- |
| Student         | student_id     | Stores user profile       |
| Subject         | subject_id     | Academic subject          |
| Topic           | topic_id       | Individual syllabus topic |
| Exam            | exam_id        | Exam schedule             |
| StudyPlan       | plan_id        | Adaptive timetable        |
| StudySession    | session_id     | Daily study session       |
| Question        | question_id    | AI generated questions    |
| Assessment      | assessment_id  | Quiz metadata             |
| Answer          | answer_id      | Student responses         |
| Performance     | performance_id | Learning metrics          |
| Prediction      | prediction_id  | ML outputs                |
| RevisionHistory | revision_id    | Revision records          |

## 3\. Relationship Mapping

Student 1..\* Subject  
Subject 1..\* Topic  
Topic 1..\* Question  
Student 1..\* StudyPlan  
StudyPlan 1..\* StudySession  
StudySession 1..\* Assessment  
Assessment 1..\* Answer  
Topic 1..\* Performance  
Performance 1..\* Prediction  
Topic 1..\* RevisionHistory

## 4\. Normalization

First Normal Form (1NF): Atomic attributes only.  
Second Normal Form (2NF): Partial dependencies removed.  
Third Normal Form (3NF): Transitive dependencies eliminated.  
The operational schema is maintained in 3NF to minimize redundancy while preserving efficient query performance.

## 5\. SQL Schema Overview

Representative tables:  
CREATE TABLE Student(...)  
CREATE TABLE Subject(...)  
CREATE TABLE Topic(...)  
CREATE TABLE StudyPlan(...)  
CREATE TABLE Question(...)  
CREATE TABLE Assessment(...)  
CREATE TABLE Performance(...)  
CREATE TABLE Prediction(...)  
Foreign keys enforce referential integrity between related entities.

## 6\. Indexing Strategy

| Index         | Reason                  |
| ------------- | ----------------------- |
| student_id    | Frequent profile lookup |
| topic_id      | Topic analytics         |
| subject_id    | Subject filtering       |
| exam_date     | Timetable generation    |
| assessment_id | Assessment retrieval    |
| prediction_id | Dashboard analytics     |

## 7\. Constraints

• Primary keys for every entity.  
• Foreign key integrity.  
• Unique email for each student.  
• Non-negative study hours.  
• Valid exam dates.  
• Cascading updates where appropriate.

## 8\. Data Dictionary

Core logical objects include Student Profile, Subject, Topic, Exam Schedule, Study Plan, Study Session, Question, Answer, Performance Metrics, Topic Mastery, Revision Efficiency, Forgetting Index, Prediction and Dashboard Report.

## 9\. Design Decisions

• Relational model selected because the data is highly structured.  
• SQLite chosen for MVP; PostgreSQL for production.  
• AI-generated content stored separately from assessment history.  
• Historical predictions preserved for trend analysis.

## 10\. Future Enhancements

Partitioned analytics tables, audit logging, backup strategy, encryption at rest, cloud-hosted PostgreSQL, and data warehouse integration for advanced educational analytics.

## Traceability

Supports Volume I Chapter 5 (Database Design), UML Class Diagram, DFDs, API Engineering and Backend Implementation.