# Master Project Design Specification

## Adaptive AI Exam Preparation and Performance Analytics System

## Chapter 2 - Problem Statement & Objectives

### 2.1 Existing Scenario

Students preparing for examinations usually depend on handwritten timetables,  
calendar reminders, static study planner applications, YouTube playlists and  
random online quizzes. These tools solve isolated problems but do not understand  
the student's actual preparation level. A fixed timetable created on Day 1 usually  
remains unchanged until the examination, even if the student's strengths and  
weaknesses change significantly.

### 2.2 Problem Statement

There is currently no integrated system that accepts a syllabus, plans study  
sessions, generates fresh questions dynamically, evaluates objective and subjective  
answers, measures learning behaviour, predicts examination readiness and  
continuously adapts future study plans using Artificial Intelligence and Machine  
Learning. Students therefore spend excessive time on mastered topics, insufficient  
time on weak topics and receive little evidence of whether they are truly ready  
for the examination.

### 2.3 Research Gap

Existing timetable applications focus on scheduling. Quiz applications focus on  
assessment. LLM chatbots answer questions on demand. Learning management systems  
track completion. Very few systems combine adaptive planning, AI-generated  
assessment, ML-based analytics and continuous timetable optimisation in a single  
learning ecosystem.

| Existing Solution | Strength          | Limitation              | Gap Addressed        |
| ----------------- | ----------------- | ----------------------- | -------------------- |
| Timetable Apps    | Planning          | No adaptation           | Adaptive planning    |
| Quiz Platforms    | Assessment        | Static questions        | Dynamic AI questions |
| LLM Chatbots      | Explanations      | No tracking             | Performance tracking |
| LMS               | Course management | Limited personalization | Personal AI tutor    |

### 2.4 Objectives

Primary Objective:  
Develop an adaptive AI-powered learning assistant that creates personalised study  
plans, generates dynamic assessments using Ollama, evaluates performance using  
Machine Learning and continuously improves the student's preparation strategy.  
<br/>Secondary Objectives:  
• Parse syllabus and extract topics.  
• Calculate available preparation time.  
• Allocate study hours intelligently.  
• Generate Easy/Moderate/Hard MCQs and descriptive questions.  
• Measure accuracy, response time, skip behaviour and revision quality.  
• Compute Topic Mastery, Revision Efficiency and Exam Readiness.  
• Adapt future schedules after every assessment cycle.

### 2.5 Functional Goals

The system shall:  
1\. Accept syllabus PDF/manual input.  
2\. Extract subjects and topics.  
3\. Maintain exam calendar.  
4\. Build an initial timetable.  
5\. Generate AI questions for every topic.  
6\. Evaluate MCQs automatically.  
7\. Evaluate descriptive answers.  
8\. Record response time.  
9\. Allow Skip and Mark-for-Later.  
10\. Track revision completion.  
11\. Predict readiness.  
12\. Update timetable automatically.

### 2.6 Success Metrics

Project success will be measured using:  
• Timetable generation accuracy  
• Topic coverage  
• Assessment completion rate  
• Topic mastery improvement  
• Revision efficiency improvement  
• Predicted exam readiness  
• User satisfaction  
• System response time.

### 2.7 Scope Boundaries

Included:  
• Student-facing web application  
• Local Ollama integration  
• ML-based analytics  
• Adaptive timetable  
• Dashboard  
<br/>Excluded in Version 1:  
• Multi-language support  
• Faculty portal  
• Mobile application  
• Cloud deployment  
• Institutional ERP integration

### 2.8 Design Decisions

Decision 1: Use a local LLM (Ollama) to eliminate API costs and preserve privacy.  
Decision 2: Separate AI (content generation) from ML (prediction).  
Decision 3: Use adaptive scheduling instead of fixed schedules.  
Decision 4: Evaluate behaviour (response time, skips, revisions) in addition to marks.

### 2.9 Chapter Summary

This chapter formally defines the problem addressed by the project, identifies  
the research gap, establishes measurable objectives, defines project boundaries  
and documents the major design decisions that guide the remaining architecture.