# Feature Builder & Centralized vLLM Architecture Guide

This skill documents the full-stack architecture, client-server API interaction model, feature breakdown, and central vLLM inference setup for the **AI-Powered Personalized Study Planner and Performance Analyser**.

---

## 🏛️ System Architecture

```
                    STUDENT LAPTOPS (Client Side)
         Student 1            Student 2            Student 3
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │ REST API (HTTP)
                                  ▼
                     MAIN SERVER LAPTOP (Server Side)
        +--------------------------------------------------------+
        | React Frontend SPA (frontend/)                         |
        | FastAPI Backend API (backend/)                         |
        | SQLite Database (aiml_system.db)                       |
        | ML Analytics Engine (Scikit-Learn)                     |
        | Admin Orchestrator Dashboard (/admin & /api/admin)     |
        +---------------------------+----------------------------+
                                    │ OpenAI API Client (llm_client.py)
                                    ▼
                         vLLM INFERENCE IN WSL2
        +--------------------------------------------------------+
        | vLLM Server (Host: localhost, Port: 8001)               |
        | OpenAI-compatible endpoint (/v1/chat/completions)      |
        | Continuous Batching & KV Cache                         |
        | GPU Acceleration (NVIDIA CUDA)                         |
        +--------------------------------------------------------+
```

---

## 📊 Feature Classification Matrix

| Category | Feature | Execution Location | Route / Module |
| :--- | :--- | :--- | :--- |
| **Non-LLM** | Student Authentication (JWT) | FastAPI & SQLite | `POST /api/user/login` |
| **Non-LLM** | Profile & Preferences Setup | FastAPI & SQLite | `POST /api/user/preferences` |
| **Non-LLM** | Timetable Schedule Solver | FastAPI Backend (`planning/utils.py`) | `POST /api/planning/generate-timetable` |
| **Non-LLM** | Performance Analytics & ML | FastAPI Backend (`ml/pipeline.py`) | `GET /api/ml/predict-performance` |
| **LLM-Dependent** | Syllabus Upload & Topic Extraction | vLLM via `llm_client.py` | `POST /api/syllabus/upload` |
| **LLM-Dependent** | Quiz Generation (MCQ / Descriptive) | vLLM via `llm_client.py` | `POST /api/ai/generate-quiz` |
| **LLM-Dependent** | AI Progressive Hints | vLLM via `llm_client.py` | `POST /api/ai/hint` |
| **LLM-Dependent** | Detailed Concept Explanations | vLLM via `llm_client.py` | `POST /api/ai/explanation` |
| **LLM-Dependent** | Flashcard Deck Generation | vLLM via `llm_client.py` | `POST /api/ai/flashcards` |
| **LLM-Dependent** | Bite-Sized Summary Generation | vLLM via `llm_client.py` | `POST /api/ai/summary` |
| **LLM-Dependent** | Subject Mock Test Generation | vLLM via `llm_client.py` | `POST /api/ai/mocktest` |
| **LLM-Dependent** | Burnout & Wellness Recommendations | vLLM via `llm_client.py` | `POST /api/ai/wellness` |
| **Admin Orchestration** | GPU & Server Metrics Tracking | FastAPI Backend (`admin/routes.py`) | `GET /api/admin/metrics` |

---

## 🖥️ Server Admin Orchestrator & Telemetry
The main server laptop exposes `/admin` and `/api/admin/metrics` to track:
- **GPU Usage**: GPU Utilization %, Used VRAM / Total VRAM (MB/GB), GPU temperature via `nvidia-smi` / PyNVML parsing.
- **vLLM Inference Health**: Ping response, base URL, model name loaded, average inference latency.
- **Inference Telemetry**: Total LLM calls processed broken down by feature (Quizzes, Hints, Explanations, Summaries).
- **System Activity**: Connected active students count, total study plans created, quiz attempts recorded.
