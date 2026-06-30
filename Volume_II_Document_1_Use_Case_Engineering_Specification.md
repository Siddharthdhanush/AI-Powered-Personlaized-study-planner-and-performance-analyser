# Volume II - Engineering Appendix

## Section A - UML Modeling

## Document 1 - Use Case Engineering Specification

### Purpose

This document formally specifies the Use Case Model for the Adaptive AI Exam Preparation and Performance Analytics System. It identifies all actors, their responsibilities, system interactions, and functional boundaries. All later UML diagrams (Activity, Sequence, Class, Component and Deployment) will be derived from this model.

### Primary Actors

1\. Student  
2\. Administrator  
3\. Ollama AI Engine  
4\. Machine Learning Engine  
5\. Database  
6\. Notification Service (Future)  
7\. Authentication Service

| Actor                | Use Cases                                                                                                                                                                                                                                | Priority | Remarks      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------ |
| Student              | Register, Login, Upload Syllabus, Enter Exam Dates, Configure Preferences, Generate Timetable, Start Study Session, Attempt Quiz, Skip Question, Request Hint, View Explanation, Mark Revision Complete, View Dashboard, Download Report | High     | Primary user |
| Administrator        | Manage users, Monitor system, Manage models                                                                                                                                                                                              | Medium   | Future       |
| Ollama AI            | Generate questions, summaries, hints, flashcards                                                                                                                                                                                         | High     | AI module    |
| ML Engine            | Predict mastery, readiness, priority                                                                                                                                                                                                     | High     | Analytics    |
| Database             | Store and retrieve all data                                                                                                                                                                                                              | High     | Persistence  |
| Notification Service | Study reminders                                                                                                                                                                                                                          | Low      | Future       |
| Authentication       | Login verification                                                                                                                                                                                                                       | High     | Security     |

### Complete Student Use Cases

UC1 Register/Login  
UC2 Upload syllabus  
UC3 Extract topics  
UC4 Enter exam schedule  
UC5 Configure daily study hours  
UC6 Generate personalized timetable  
UC7 Start study session  
UC8 Receive AI-generated questions  
UC9 Answer MCQs  
UC10 Answer descriptive questions  
UC11 Skip question  
UC12 Mark for later  
UC13 Request hint  
UC14 View explanation  
UC15 Complete revision  
UC16 View analytics dashboard  
UC17 Download progress report  
UC18 Receive adaptive timetable update

### Relationships

Include:  
• Generate Timetable includes Calculate Priority Scores.  
• Study Session includes Assessment.  
• Assessment includes Performance Analysis.  
• Performance Analysis includes ML Prediction.  
• ML Prediction extends Adaptive Timetable Update.  
• Request Hint extends Assessment.  
• View Explanation extends Assessment.

### PlantUML Draft

@startuml  
actor Student  
actor Administrator  
rectangle System {  
Student --> (Upload Syllabus)  
Student --> (Generate Timetable)  
Student --> (Start Study Session)  
Student --> (Attempt Quiz)  
Student --> (Request Hint)  
Student --> (View Dashboard)  
Student --> (Download Report)  
Administrator --> (Manage Users)  
}  
@enduml

### Next UML Documents

1\. Activity Diagram  
2\. Sequence Diagram  
3\. Class Diagram  
4\. Component Diagram  
5\. Deployment Diagram  
6\. State Diagram