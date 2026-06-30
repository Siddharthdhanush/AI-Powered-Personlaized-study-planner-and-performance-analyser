Volume II - Engineering Appendix

# Section F - Machine Learning Engineering

## Purpose

This section specifies the Machine Learning subsystem responsible for analysing student learning behaviour, predicting topic mastery, estimating exam readiness and supporting adaptive timetable generation.

## 1\. ML Architecture

Pipeline:  
Assessment Data → Preprocessing → Feature Engineering → Model Inference → Predictions → Adaptive Planner → Dashboard

## 2\. Prediction Tasks

| Task                             | Algorithm           | Output                      | Consumer           |
| -------------------------------- | ------------------- | --------------------------- | ------------------ |
| Topic Mastery                    | Decision Tree       | Strong/Moderate/Weak        | Planner            |
| Subjective Answer Classification | Naive Bayes         | Relevant/Partial/Irrelevant | Assessment         |
| Exam Readiness                   | Logistic Regression | 0-100% Probability          | Dashboard          |
| Priority Score                   | Rule + ML Features  | Continuous Value            | Adaptive Timetable |

## 3\. Feature Engineering

| Feature             | Description                | Type        |
| ------------------- | -------------------------- | ----------- |
| MCQ Accuracy        | Objective score            | Numeric     |
| Subjective Score    | LLM/NB evaluation          | Numeric     |
| Response Time       | Seconds per question       | Numeric     |
| Skip Count          | Skipped questions          | Numeric     |
| Hint Usage          | Hints consumed             | Numeric     |
| Confidence          | Student self-rating        | Numeric     |
| Revision Count      | Completed revisions        | Numeric     |
| Revision Efficiency | Improvement after revision | Numeric     |
| Forgetting Index    | Retention estimate         | Numeric     |
| Study Hours         | Time invested              | Numeric     |
| Topic Difficulty    | Easy/Medium/Hard           | Categorical |

## 4\. Dataset Schema

Training Dataset Columns:  
student_id, subject_id, topic_id, accuracy, subjective_score,  
response_time, skip_count, hint_usage, confidence,  
revision_efficiency, forgetting_index, study_hours,  
topic_difficulty, topic_mastery_label, exam_readiness_label

## 5\. Data Preprocessing

• Handle missing values  
• Encode categorical variables  
• Normalize numerical features where required  
• Remove duplicates  
• Split into training and testing datasets  
• Validate data consistency

## 6\. Model Training Strategy

Decision Tree:  
Predict topic mastery.  
<br/>Naive Bayes:  
Classify textual answer relevance.  
<br/>Logistic Regression:  
Estimate probability of exam readiness.

## 7\. Evaluation Metrics

| Metric           | Purpose                     |
| ---------------- | --------------------------- |
| Accuracy         | Overall correctness         |
| Precision        | Positive prediction quality |
| Recall           | Detection of weak topics    |
| F1 Score         | Balanced evaluation         |
| Confusion Matrix | Class-wise analysis         |

## 8\. Hyperparameter Configuration

Decision Tree: max_depth, criterion, min_samples_split  
Naive Bayes: smoothing parameter  
Logistic Regression: solver, regularization, max_iter

## 9\. Model Deployment

Trained models are serialized (joblib) and loaded by the Backend Prediction Service. Predictions are generated after every assessment and stored in the Prediction repository.

## 10\. Retraining Strategy

Models can be retrained periodically as more assessment data becomes available. Historical prediction performance will be monitored to detect model drift.

## 11\. Design Decisions

• Interpretable algorithms selected for educational transparency.  
• Separate models used for distinct prediction tasks.  
• Feature engineering emphasizes learning behaviour rather than marks alone.  
• ML predicts; AI generates educational content.

## 12\. Traceability

Supports:  
• Volume I Machine Learning Pipeline  
• Adaptive Timetable Engine  
• Dashboard Analytics  
• Volume III ML Implementation