Volume II - Engineering Appendix

# Section D - API Engineering

## Purpose

This section defines the REST API specification for the Adaptive AI Exam Preparation and Performance Analytics System. It describes endpoints, request/response formats, authentication, status codes, error handling, versioning and security practices. These APIs will be implemented using FastAPI in Volume III.

## 1\. API Architecture

Architecture Style: RESTful  
Protocol: HTTPS  
Data Format: JSON  
Authentication: JWT (future), local session for MVP  
Versioning: /api/v1/

## 2\. Authentication APIs

| Method | Endpoint         | Purpose           | Response       |
| ------ | ---------------- | ----------------- | -------------- |
| POST   | /api/v1/register | Create account    | 201 Created    |
| POST   | /api/v1/login    | Authenticate user | 200 OK + Token |
| POST   | /api/v1/logout   | End session       | 200 OK         |
| GET    | /api/v1/profile  | Fetch profile     | 200 OK         |

## 3\. Syllabus & Planning APIs

POST /api/v1/syllabus/upload  
POST /api/v1/exams  
POST /api/v1/timetable/generate  
GET /api/v1/timetable  
PUT /api/v1/timetable/update

## 4\. AI Service APIs

POST /api/v1/ai/questions  
POST /api/v1/ai/hints  
POST /api/v1/ai/summary  
POST /api/v1/ai/flashcards  
POST /api/v1/ai/explanation

## 5\. Assessment APIs

POST /api/v1/assessment/start  
POST /api/v1/assessment/submit  
GET /api/v1/assessment/result  
GET /api/v1/assessment/history

## 6\. ML Analytics APIs

POST /api/v1/ml/predict  
GET /api/v1/ml/mastery  
GET /api/v1/ml/readiness  
GET /api/v1/ml/revision-efficiency  
GET /api/v1/ml/forgetting-index

## 7\. Dashboard APIs

GET /api/v1/dashboard  
GET /api/v1/dashboard/progress  
GET /api/v1/dashboard/recommendations  
GET /api/v1/dashboard/reports

## 8\. Standard JSON Format

Request:  
{  
"student_id": 1,  
"topic": "Decision Trees"  
}  
<br/>Response:  
{  
"status": "success",  
"data": { ... },  
"message": "Operation completed"  
}

## 9\. HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 500  | Internal Server Error |

## 10\. Error Handling

Every error response returns:  
• timestamp  
• status code  
• error message  
• endpoint  
• request id  
• suggested recovery action

## 11\. Security

JWT authentication (future), HTTPS, input validation, rate limiting, role-based authorization, backend-only database access and local Ollama integration for privacy.

## 12\. API Design Decisions

• REST selected for simplicity.  
• JSON chosen for interoperability.  
• Versioned endpoints support future upgrades.  
• AI and ML exposed as independent services.

## Traceability

Supports Backend Architecture, Component Diagram, Deployment Diagram, Database Engineering and Volume III FastAPI implementation.