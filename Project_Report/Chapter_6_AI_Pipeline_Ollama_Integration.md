# Master Project Design Specification

## Adaptive AI Exam Preparation and Performance Analytics System

## Chapter 6 - Artificial Intelligence Pipeline (Ollama Integration)

### 6.1 Purpose

This chapter specifies the complete Artificial Intelligence pipeline used in the proposed system. The AI engine is responsible for generating educational content dynamically using a locally hosted Large Language Model (LLM) through Ollama. Unlike the Machine Learning module, which predicts student performance, the AI module creates questions, hints, summaries, explanations and revision material.

### 6.2 Why Ollama?

| Factor        | Ollama          | Reason                                     |
| ------------- | --------------- | ------------------------------------------ |
| Cost          | Free            | No API charges                             |
| Privacy       | Local execution | Student data stays on device               |
| Offline       | Supported       | Internet not required after model download |
| Scalability   | Multiple models | Easy model replacement                     |
| Customization | High            | Prompt engineering possible                |

### 6.3 Supported Models

Recommended models:  
• Llama 3 (general purpose)  
• Gemma (lightweight)  
• Mistral (fast inference)  
The system architecture allows switching models without changing business logic.

### 6.4 AI Responsibilities

• Generate Easy, Moderate and Hard questions.

• Generate MCQs and descriptive questions.

• Generate explanations after assessment.

• Generate hints when requested.

• Generate concise revision notes.

• Generate flashcards and mnemonics.

• Generate topic summaries before revision.

• Generate mock tests before examinations.

### 6.5 AI Pipeline

Syllabus Topic  
↓  
Prompt Builder  
↓  
Difficulty Selector  
↓  
Ollama API  
↓  
LLM Response  
↓  
Validation Layer  
↓  
Question Formatter  
↓  
Database  
↓  
Assessment Engine

### 6.6 Prompt Engineering Strategy

The quality of generated educational content depends primarily on prompt design. Every prompt contains:  
• Subject  
• Topic  
• Difficulty level  
• Question type  
• Learning objective  
• Expected answer format  
• Bloom's taxonomy level (future enhancement)  
<br/>The prompt builder standardizes requests so that generated content remains consistent across all subjects.

### 6.7 Prompt Templates

Question Generation Prompt:  
'Generate three Easy, three Moderate and three Hard questions for the topic &lt;Topic&gt;. Include MCQs with four options and descriptive questions. Provide the correct answer separately.'  
<br/>Hint Prompt:  
'Provide a hint without revealing the complete answer.'  
<br/>Summary Prompt:  
'Summarize the topic in concise revision notes suitable for exam preparation.'  
<br/>Flashcard Prompt:  
'Create flashcards containing question-answer pairs for rapid revision.'

### 6.8 Dynamic Difficulty Logic

The AI engine receives the current Topic Mastery from the ML module.  
If mastery is high, more Moderate and Hard questions are generated.  
If mastery is low, the system increases Easy questions, explanations and hints.  
Difficulty therefore adapts continuously rather than remaining fixed.

### 6.9 Validation Layer

Generated responses are checked before being shown to the student.  
Validation includes:  
• Empty response detection  
• Duplicate question detection  
• Difficulty verification  
• Response formatting  
• Basic syllabus relevance checks  
Invalid outputs trigger regeneration.

### 6.10 Communication with Other Modules

| Module          | Input to AI     | Output from AI | Purpose           |
| --------------- | --------------- | -------------- | ----------------- |
| Planner         | Topic           | Questions      | Assessment        |
| Assessment      | Student request | Hints          | Learning support  |
| Dashboard       | Topic           | Summary        | Revision          |
| Adaptive Engine | Difficulty      | New questions  | Adaptive learning |

### 6.11 Error Handling

If Ollama is unavailable, the system informs the user, preserves current progress and retries generation after the model becomes available. Future versions may cache previously generated content for offline fallback.

### 6.12 Security & Privacy

No student data is transmitted to external AI providers. All prompts and responses remain on the local system, improving privacy and reducing dependency on cloud services.

### 6.13 Future Enhancements

• Personalized prompts based on learning style.  
• Automatic difficulty calibration.  
• Diagram generation.  
• Voice-based explanations.  
• Multi-language support.  
• Retrieval-Augmented Generation (RAG) using uploaded notes.

### 6.14 Design Decisions

• Local LLM selected over cloud APIs.  
• Prompt templates standardized for consistency.  
• AI dedicated only to content generation.  
• ML retained separately for prediction and analytics.  
• Validation layer inserted to improve reliability.

### 6.15 Chapter Summary

This chapter defines the complete AI content generation pipeline centred on Ollama. It explains model selection, prompt engineering, adaptive question generation, validation and interaction with the remaining software modules. The next chapter will describe the complete Machine Learning pipeline and prediction workflow.