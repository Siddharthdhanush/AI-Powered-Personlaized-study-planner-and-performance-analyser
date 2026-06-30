Volume II - Engineering Appendix

# Section E - Artificial Intelligence Engineering

## Purpose

This section defines the engineering specification of the Artificial Intelligence subsystem. It documents the Ollama architecture, model selection, prompt engineering strategy, prompt templates, response validation, caching, fallback mechanisms, privacy considerations and the AI prompt library used throughout the system.

## 1\. AI Architecture

AI Runtime: Ollama (Local)  
Primary Role: Dynamic educational content generation  
Functions:  
• Question generation  
• Hint generation  
• Topic summaries  
• Flashcards  
• Explanations  
• Mock tests  
• Study strategy recommendations  
• Wellness recommendations

## 2\. Supported Models

| Model   | Purpose         | Advantages         | Future   |
| ------- | --------------- | ------------------ | -------- |
| Llama 3 | General content | High quality       | Primary  |
| Mistral | Fast generation | Low latency        | Optional |
| Gemma   | Lightweight     | Low resource usage | Fallback |

## 3\. Prompt Engineering Framework

Every prompt contains:  
• Subject  
• Topic  
• Difficulty  
• Learning objective  
• Question type  
• Expected output format  
• Evaluation rules  
• Language

## 4\. Prompt Library

| Prompt Type         | Purpose                           | Output                 |
| ------------------- | --------------------------------- | ---------------------- |
| Question Generation | Create Easy/Medium/Hard questions | MCQs + Descriptive     |
| Hint Generation     | Progressive hints                 | Hint 1, Hint 2, Hint 3 |
| Summary             | Revision notes                    | Concise summary        |
| Flashcards          | Active recall                     | Q&A cards              |
| Explanation         | Explain mistakes                  | Correct concept        |
| Mock Test           | Generate complete paper           | Timed assessment       |
| Study Strategy      | Learning recommendations          | Technique suggestions  |
| Wellness            | Break & refreshment advice        | Break plan             |

## 5\. Prompt Templates

Question Prompt:  
Generate 3 Easy, 3 Medium and 3 Hard questions for the given topic. Include MCQs with four options and descriptive questions. Return answers separately.  
<br/>Hint Prompt:  
Provide progressive hints without revealing the final answer.  
<br/>Summary Prompt:  
Summarize the topic for quick revision within 150 words.  
<br/>Flashcard Prompt:  
Generate concise question-answer flashcards.  
<br/>Wellness Prompt:  
Based on study duration, response time and fatigue indicators, recommend an appropriate break or study strategy.

## 6\. AI Response Validation

Validation checks:  
• Empty response  
• Duplicate questions  
• Difficulty balance  
• Topic relevance  
• Structured JSON format  
• Answer completeness  
• Unsafe content filtering

## 7\. AI Request Pipeline

Frontend → Backend → Prompt Builder → Ollama → Response Validator → Formatter → Database → Dashboard

## 8\. Caching & Fallback

Frequently requested content may be cached. If Ollama is temporarily unavailable, the system retries the request and may serve cached educational content until AI generation resumes.

## 9\. Privacy & Security

All AI inference is performed locally using Ollama. Student data remains on the user's device, reducing privacy risks and eliminating dependence on external cloud AI services.

## 10\. Design Decisions

• Local LLM chosen over cloud APIs.  
• Prompt templates standardized.  
• AI restricted to content generation while ML performs prediction.  
• Modular design allows replacing the underlying LLM without changing application logic.

## 11\. Traceability

Supports:  
• AI Pipeline (Volume I)  
• API Engineering  
• Assessment Engine  
• Learning Optimization Engine  
• Volume III Ollama Integration