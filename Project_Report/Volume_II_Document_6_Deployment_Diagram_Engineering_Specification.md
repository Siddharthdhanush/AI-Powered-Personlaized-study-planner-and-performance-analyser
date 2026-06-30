# Volume II - Engineering Appendix

## Section A - UML Modeling

## Document 6 - Deployment Diagram Engineering Specification

### Purpose

This document specifies the deployment architecture for the Adaptive AI Exam Preparation and Performance Analytics System, including hardware nodes, software nodes, execution environments, communication protocols, and future cloud scalability.

| Node               | Software        | Responsibility         | Protocol     | Future Upgrade |
| ------------------ | --------------- | ---------------------- | ------------ | -------------- |
| Client             | Browser + React | User Interface         | HTTPS        | Mobile App     |
| Application Server | FastAPI         | Business Logic         | REST         | Load Balancer  |
| AI Server          | Ollama          | AI Question Generation | HTTP         | Dedicated GPU  |
| ML Service         | Scikit-learn    | Prediction Engine      | Internal API | Model Server   |
| Database           | SQLite          | Persistent Storage     | SQL          | PostgreSQL     |

### Deployment Architecture

Development: Browser → React → FastAPI → SQLite with FastAPI communicating locally to Ollama and the ML Engine. Future production deployment replaces SQLite with PostgreSQL and introduces reverse proxy, load balancing and dedicated AI/ML services.

### Communication

Browser↔Backend uses HTTPS. Backend↔Database uses SQL. Backend↔Ollama uses local HTTP API. Backend↔ML Engine uses internal service calls. Backend↔Dashboard exchanges JSON.

### Execution Environment

Frontend: React  
Backend: FastAPI  
AI Runtime: Ollama  
ML Runtime: scikit-learn  
Database: SQLite (development), PostgreSQL (future)

### Security

Authentication before data access, backend-only database access, local AI for privacy, HTTPS for production, input validation on all APIs.

### PlantUML Draft

@startuml  
node Client { component Browser }  
node Server {  
component React  
component FastAPI  
}  
node AI { component Ollama }  
node ML { component Prediction }  
database SQLite  
Browser --> React  
React --> FastAPI  
FastAPI --> SQLite  
FastAPI --> Ollama  
FastAPI --> Prediction  
@enduml

### Design Decisions

Local deployment for MVP, modular AI/ML services, backend as orchestration layer, cloud-ready architecture.

### Traceability

Derived from Component Diagram and supports API Design, DevOps planning and Volume III implementation.