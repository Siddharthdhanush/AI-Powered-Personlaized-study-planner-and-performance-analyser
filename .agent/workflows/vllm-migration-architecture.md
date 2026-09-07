# Centralized vLLM Migration & Admin Orchestrator Workflow

This workflow details the step-by-step migration process from local Ollama to a centralized vLLM inference server with client-server separation and an Admin Orchestrator Dashboard.

---

## 📋 Implementation Workflow Tasks

### Task 1: Environment & Dependencies Setup (Server Side)
- Update `backend/requirements.txt`: remove `ollama`, add `openai` SDK.
- Update `backend/core/config.py`: add `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_TIMEOUT`, `LLM_MAX_RETRIES`.

### Task 2: Implement `llm_client.py` (vLLM OpenAI Driver)
- Create `backend/ai/llm_client.py` using `AsyncOpenAI` or `OpenAI` client pointing to `LLM_BASE_URL`.
- Implement robust `generate_text()`, `generate_json()`, and `generate_chat_completion()` methods with retries, markdown block stripping, and `_unwrap_response()` parsing.
- Add telemetry hooks inside `llm_client.py` to record LLM inference request counts, feature usage breakdown, and latency.

### Task 3: Migrate AI Generator Modules
- Refactor all generators (`question_generator.py`, `syllabus_generator.py`, `explanation_generator.py`, `hint_generator.py`, `summary_generator.py`, `flashcard_generator.py`, `mocktest_generator.py`, `study_strategy.py`, `wellness.py`, `utils.py`, `routes.py`, `models.py`) from `ollama_client` to `llm_client`.
- Remove legacy `backend/ai/ollama_client.py` and update `backend/main.py` shutdown hooks.

### Task 4: Implement Server Admin Orchestrator Endpoint
- Create `backend/admin/routes.py` and register `/api/admin/metrics`.
- Parse GPU metrics (GPU Utilization %, VRAM used/total, GPU temperature) using `nvidia-smi` / `subprocess`.
- Include vLLM server ping check, active student counts, total study plans created, and LLM telemetry breakdown.

### Task 5: Implement Frontend Admin Orchestrator Dashboard
- Create `frontend/src/pages/AdminDashboard.jsx`.
- Render real-time GPU VRAM gauges, GPU load, vLLM status indicator, active connection counters, and feature usage analytics.
- Register route `/admin` in `frontend/src/App.jsx`.

### Task 6: End-to-End Testing & Verification
- Execute `test_api.py` to verify API endpoint integrity.
- Verify separate terminal execution of `backend/` server and `frontend/` client.
