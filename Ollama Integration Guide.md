# Ollama Integration Guide
## Adaptive AI Exam Preparation & Performance Analytics System

**Version:** 1.0  
**Project Module:** Module 4 – AI Learning Module  
**Author:** Project Documentation  
**LLM Runtime:** Ollama

---

# 1. Purpose

This document explains how to set up Ollama, download the required Large Language Models (LLMs), integrate them into the project, and use them to generate educational content such as questions, summaries, hints, explanations, flashcards, and mock tests.

The project uses **local LLMs** instead of cloud APIs to ensure:

- Completely free usage
- Offline capability
- Student data privacy
- No API costs
- Faster local inference

---

# 2. Why Ollama?

Ollama provides an easy way to run open-source Large Language Models locally.

Advantages:

- Free
- Offline
- Cross-platform
- REST API
- Python SDK
- Easy model switching
- Supports many open-source LLMs

---

# 3. Recommended Model Strategy

| Task | Recommended Model | Reason |
|-------|-------------------|--------|
| Question Generation | Llama 3 | Best reasoning and educational content |
| Topic Summaries | Llama 3 | High quality explanations |
| Flashcards | Gemma 2B | Lightweight and fast |
| Hint Generation | Gemma 2B | Low latency |
| Mock Tests | Llama 3 | Better reasoning |
| Study Strategy | Mistral | Instruction following |
| Wellness Tips | Mistral | Conversational responses |

---

# MVP Recommendation

For the first implementation use only:

```
llama3
```

Do NOT use multiple models initially.

After the MVP is stable, additional models can be added.

---

# 4. Install Ollama

Download from:

https://ollama.com/download

Install normally.

After installation open PowerShell or Terminal.

Run:

```bash
ollama
```

Expected output:

```
Commands

run
pull
list
serve
...
```

If you see the commands, Ollama has been installed successfully.

---

# 5. Download Models

## Llama 3 (Recommended)

```bash
ollama pull llama3
```

Approximate size

```
4.7 GB
```

---

## Mistral

```bash
ollama pull mistral
```

Approximate size

```
4 GB
```

---

## Gemma

```bash
ollama pull gemma:2b
```

Approximate size

```
1.7 GB
```

---

# 6. Verify Installation

List installed models.

```bash
ollama list
```

Example

```
NAME

llama3

mistral

gemma
```

---

# 7. Test Model

Run

```bash
ollama run llama3
```

Type

```
Explain Machine Learning.
```

The model should answer.

If it answers correctly the installation is complete.

---

# 8. Start Ollama Server

Run

```bash
ollama serve
```

Default endpoint

```
http://localhost:11434
```

The backend communicates with this endpoint.

---

# 9. Python Environment

Inside the project virtual environment install

```bash
pip install ollama
```

or

```bash
pip install requests
```

Both methods are acceptable.

---

# 10. Project Folder Structure

```
backend/

    ai/

        __init__.py

        ollama_client.py

        prompts.py

        formatter.py

        validator.py

        question_generator.py

        summary_generator.py

        hint_generator.py

        explanation_generator.py

        flashcard_generator.py

        mocktest_generator.py

        study_strategy.py

        wellness.py
```

---

# 11. AI Architecture

```
Student

↓

Frontend

↓

FastAPI Backend

↓

AI Module

↓

Prompt Builder

↓

Ollama Client

↓

Llama 3

↓

Formatter

↓

Validator

↓

Database

↓

Assessment

↓

Dashboard
```

---

# 12. AI Responsibilities

The AI module is responsible for generating educational content.

Supported services

- Question Generation
- Topic Summary
- Hint Generation
- Flashcards
- Explanations
- Mock Tests
- Study Strategy
- Wellness Recommendation

The AI module does NOT perform machine learning predictions.

---

# 13. Prompt Engineering Rules

Never use vague prompts.

Bad Example

```
Generate Python questions.
```

Good Example

```
You are an experienced university professor.

Generate:

3 Easy MCQs

3 Moderate MCQs

3 Hard MCQs

3 Easy Descriptive Questions

3 Moderate Descriptive Questions

3 Hard Descriptive Questions

Topic:

Python Functions

Return the response as JSON.
```

Always request structured JSON output.

---

# 14. Expected AI Response Format

Every AI response should follow JSON.

Example

```json
{
  "topic":"Python Functions",
  "easy":[
    {
      "type":"mcq",
      "question":"...",
      "options":[
        "...",
        "...",
        "...",
        "..."
      ],
      "answer":"..."
    }
  ]
}
```

Never return plain paragraphs for question generation.

---

# 15. AI Workflow

Student uploads syllabus

↓

Parser extracts topics

↓

Question Generator builds prompt

↓

Prompt sent to Ollama

↓

Llama 3 generates content

↓

Validator checks structure

↓

Formatter converts output

↓

Store in Database

↓

Assessment Module

---

# 16. AI Service APIs

The AI module exposes the following functions.

```
generate_questions()

generate_summary()

generate_flashcards()

generate_hints()

generate_mocktest()

generate_explanation()

generate_study_strategy()

generate_wellness_tip()
```

Every service internally communicates with Ollama.

---

# 17. Important Design Rule

Only one file is allowed to communicate directly with Ollama.

```
backend/

    ai/

        ollama_client.py
```

All other modules must use this wrapper.

Example

```
Question Generator

↓

Ollama Client

↓

Ollama

NOT

Question Generator

↓

Ollama
```

This keeps the project modular.

---

# 18. Future Improvements

The architecture should support replacing Ollama without changing business logic.

Future supported providers

- OpenAI
- Google Gemini
- Claude
- Groq
- Together AI

Only `ollama_client.py` should require modification.

---

# 19. Best Practices

- Always use structured prompts.
- Prefer JSON responses.
- Validate every AI response.
- Cache repeated responses when appropriate.
- Separate AI generation from Machine Learning prediction.
- Keep prompt templates in a dedicated file.
- Never hardcode prompts throughout the project.
- Log AI requests for debugging.
- Handle timeout and invalid JSON gracefully.

---

# 20. Final Recommendation

For the MVP:

Runtime

```
Ollama
```

Primary Model

```
llama3
```

Architecture

```
FastAPI

↓

AI Module

↓

Prompt Builder

↓

Ollama Client

↓

Llama 3

↓

Formatter

↓

Database
```

This architecture is modular, scalable, offline, privacy-preserving, and suitable for future migration to cloud LLM providers if required.
