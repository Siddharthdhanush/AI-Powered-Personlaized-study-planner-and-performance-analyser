# Volume II - Engineering Appendix

## Section A - UML Modeling

## Document 5 - Component Diagram Engineering Specification

### Purpose

This document specifies the high-level software components of the Adaptive AI Exam Preparation and Performance Analytics System, their responsibilities, provided interfaces, required interfaces and interactions. It serves as the architectural blueprint for implementation.

| Component                    | Responsibility           | Inputs             | Outputs           | Depends On       |
| ---------------------------- | ------------------------ | ------------------ | ----------------- | ---------------- |
| React Frontend               | User interface           | User actions       | API requests      | Backend API      |
| Backend API (FastAPI)        | Business logic           | HTTP requests      | Responses         | All services     |
| Authentication               | User verification        | Credentials        | Session           | Database         |
| Planning Engine              | Generate timetable       | Topics, dates      | Study plan        | ML Engine        |
| Learning Optimization Engine | Manage sessions & breaks | Performance        | Recommendations   | ML Engine        |
| Assessment Engine            | Conduct quizzes          | Questions          | Scores            | AI Engine        |
| AI Engine (Ollama)           | Generate questions       | Topic, difficulty  | Questions, hints  | LLM              |
| ML Engine                    | Predict readiness        | Assessment metrics | Predictions       | Performance data |
| Adaptive Timetable Engine    | Re-plan schedule         | Predictions        | Updated timetable | Planner          |
| Dashboard Service            | Visualize analytics      | Database           | Charts            | Backend          |
| SQLite Database              | Persistent storage       | All modules        | Stored data       | \-               |

### Component Communication

1\. Frontend communicates only with Backend API.  
2\. Backend orchestrates all business operations.  
3\. AI Engine is invoked only for content generation.  
4\. ML Engine performs prediction and analytics.  
5\. Adaptive Timetable Engine updates schedules using ML outputs.  
6\. Database stores and retrieves persistent information for all modules.

### Provided Interfaces

IUserAPI  
IPlanningService  
IAssessmentService  
IAIService  
IMLService  
IDashboardService  
IDatabaseService

### Required Interfaces

Authentication API  
Ollama REST API  
SQLite Driver  
Machine Learning Prediction Service  
Notification Service (Future)

### PlantUML Draft

@startuml  
package Frontend  
package Backend  
component "Planning Engine"  
component "Learning Optimization Engine"  
component "Assessment Engine"  
component "AI Engine (Ollama)"  
component "ML Engine"  
component "Adaptive Timetable Engine"  
database SQLite  
component Dashboard  
<br/>Frontend --> Backend  
Backend --> "Planning Engine"  
Backend --> "Assessment Engine"  
Backend --> "AI Engine (Ollama)"  
Backend --> "ML Engine"  
Backend --> "Adaptive Timetable Engine"  
Backend --> SQLite  
Backend --> Dashboard  
@enduml

### Design Decisions

• Layered architecture to reduce coupling.  
• Backend acts as the single orchestrator.  
• AI and ML are separated for maintainability.  
• Dashboard is read-only.  
• Learning Optimization Engine introduced as an independent component to manage breaks, study strategies and wellness recommendations.

### Traceability

Derived from:  
• Overall Architecture  
• Use Case Diagram  
• Activity Diagram  
• Sequence Diagram  
• Class Diagram  
<br/>Supports:  
• Deployment Diagram  
• API Design  
• Backend Implementation