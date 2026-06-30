User Module Development Specification & Antigravity Prompt

# Purpose

This document serves as a complete implementation specification for the User Module of the Adaptive AI Exam Preparation and Performance Analytics System. It is intended to be provided to an AI coding assistant (Antigravity) to generate production-quality code.

# Project Goal

Build the User Module first because every other module depends on it. The module must manage authentication, profile, preferences, sessions and progress using FastAPI, SQLAlchemy, SQLite and Pydantic.

# Architecture

- Authentication Engine
- Profile Engine
- Preference Engine
- Session Engine
- Progress Engine
- Settings Engine

# Responsibilities

- Register/Login/Logout users
- Secure password hashing using bcrypt
- Manage student profile
- Store learning preferences
- Track learning progress
- Provide REST APIs
- Persist data using SQLite

# Database Tables

| Table       | Fields                                          | Purpose   |
| ----------- | ----------------------------------------------- | --------- |
| Student     | student_id,name,email,password_hash             | Identity  |
| Preferences | daily_hours,wake_time,sleep_time,break_duration | Planning  |
| Progress    | accuracy,response_time,readiness                | Analytics |
| Session     | login_time,logout_time,device                   | Tracking  |

# Folder Structure

backend/  
user/  
\__init_\_.py  
models.py  
schemas.py  
auth.py  
profile.py  
preferences.py  
progress.py  
routes.py  
utils.py  
database.py  
config.py  
main.py  
requirements.txt

# Development Order

- Create project folders
- Create virtual environment
- Install dependencies
- Configure database
- Create SQLAlchemy models
- Create Pydantic schemas
- Implement authentication
- Implement profile APIs
- Implement preference APIs
- Implement progress APIs
- Test all APIs

# Required APIs

| Method | Endpoint     | Purpose            |
| ------ | ------------ | ------------------ |
| POST   | /register    | Create account     |
| POST   | /login       | Authenticate       |
| POST   | /logout      | Logout             |
| GET    | /profile     | Profile            |
| PUT    | /profile     | Update profile     |
| GET    | /preferences | Read preferences   |
| PUT    | /preferences | Update preferences |
| GET    | /progress    | Progress           |

# Technology Stack

Python, FastAPI, SQLAlchemy, SQLite, Pydantic, bcrypt, Uvicorn.

# Acceptance Criteria

- Database created successfully
- Authentication works
- REST APIs functional
- Validated input/output
- Modular architecture
- Ready for Syllabus Module integration

# Prompt for Antigravity

Implement the complete User Module according to this specification. Follow the folder structure, database schema, API definitions and coding standards. Produce modular, production-ready code compatible with future modules including Syllabus, Planning, AI, ML, Adaptive and Dashboard.