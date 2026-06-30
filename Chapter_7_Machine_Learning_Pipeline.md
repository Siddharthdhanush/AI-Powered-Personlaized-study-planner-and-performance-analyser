# Master Project Design Specification

## Adaptive AI Exam Preparation and Performance Analytics System

## Chapter 7 - Machine Learning Pipeline & Predictive Analytics

### 7.1 Purpose

This chapter defines the Machine Learning subsystem responsible for analysing learning behaviour, predicting topic mastery, estimating examination readiness, measuring revision efficiency and supplying intelligent feedback to the Adaptive Timetable Engine. Unlike the AI engine, which generates educational content, the ML engine analyses historical learning data and produces predictions that continuously improve the study strategy.

### 7.2 Role of Machine Learning

Machine Learning is the analytical brain of the platform. Every quiz attempt, revision session, skipped question and response time contributes to a continuously evolving student profile. These observations are transformed into numerical features that are used by prediction models to estimate learning progress and future performance.

### 7.3 Prediction Tasks

| Prediction                  | Algorithm           | Output                      | Used By          |
| --------------------------- | ------------------- | --------------------------- | ---------------- |
| Topic Mastery               | Decision Tree       | Strong/Moderate/Weak        | Adaptive Planner |
| Subjective Answer Relevance | Naive Bayes         | Relevant/Partial/Irrelevant | Assessment       |
| Exam Readiness              | Logistic Regression | Probability (0-1)           | Dashboard        |
| Priority Score              | Rule + ML Features  | Continuous Score            | Timetable Engine |

### 7.4 Feature Engineering

Every assessment generates a feature vector describing the student's behaviour.

| Feature               | Description                    | Importance |
| --------------------- | ------------------------------ | ---------- |
| MCQ Accuracy          | Correct objective answers      | High       |
| Subjective Score      | Quality of descriptive answers | High       |
| Average Response Time | Seconds per question           | High       |
| Skip Count            | Questions skipped              | Medium     |
| Retry Count           | Repeated attempts              | Medium     |
| Revision Count        | Number of revisions            | High       |
| Revision Efficiency   | Improvement after revision     | High       |
| Confidence Before     | Self rating                    | Medium     |
| Confidence After      | Updated self rating            | Medium     |
| Topic Difficulty      | Easy/Medium/Hard               | High       |
| Days Until Exam       | Remaining preparation time     | High       |
| Forgetting Index      | Estimated retention loss       | High       |

### 7.5 ML Workflow

Assessment Data  
↓  
Data Cleaning  
↓  
Feature Extraction  
↓  
Feature Vector Creation  
↓  
Model Prediction  
↓  
Topic Mastery  
Exam Readiness  
Revision Efficiency  
↓  
Adaptive Timetable Engine

### 7.6 Data Preprocessing

Before prediction, missing values are handled, numerical values are normalized where required, categorical values are encoded, duplicate records are removed and historical assessment records are aggregated into topic-wise learning profiles.

### 7.7 Algorithm Justification

| Algorithm           | Why Selected        | Advantages             | Why Not Others                           |
| ------------------- | ------------------- | ---------------------- | ---------------------------------------- |
| Decision Tree       | Explainable rules   | Interpretable, fast    | Neural networks need larger datasets     |
| Naive Bayes         | Text classification | Lightweight, efficient | SVM adds complexity                      |
| Logistic Regression | Probability output  | Simple, interpretable  | KNN scales poorly for repeated inference |

### 7.8 Derived Metrics

Topic Mastery Score combines correctness, response speed, revision efficiency and confidence. Revision Efficiency measures learning improvement between assessments. Forgetting Index estimates retention decline based on elapsed time since last successful revision. Exam Readiness combines mastery across all topics with remaining preparation time.

### 7.9 Model Evaluation

| Metric           | Purpose                         |
| ---------------- | ------------------------------- |
| Accuracy         | Overall correctness             |
| Precision        | Quality of positive predictions |
| Recall           | Detection of weak topics        |
| F1 Score         | Balanced evaluation             |
| Confusion Matrix | Class-wise analysis             |

### 7.10 Adaptive Feedback Loop

After every completed assessment, predictions are recalculated. Improved mastery reduces future study allocation, while weak performance, high skip counts, poor revision efficiency or increasing forgetting index automatically increase priority and schedule additional revision sessions.

### 7.11 Assumptions & Limitations

Predictions improve as more assessment data becomes available. Early predictions may rely on limited observations. The first version targets individual students and uses heuristic weights alongside ML outputs for timetable optimisation.

### 7.12 Design Decisions

• Separate prediction tasks across specialised models.  
• Preserve historical predictions to analyse progress over time.  
• Use interpretable algorithms suitable for educational analytics.  
• Feed every prediction into the Adaptive Timetable Engine rather than displaying scores only.

### 7.13 Chapter Summary

This chapter defines the predictive analytics engine that converts assessment behaviour into actionable insights. The next chapter will describe the Adaptive Timetable Optimisation Engine, including priority-score calculation, scheduling strategy and timetable validation.