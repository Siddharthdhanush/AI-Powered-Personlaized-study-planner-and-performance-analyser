# Master Project Design Specification

## Adaptive AI Exam Preparation and Performance Analytics System

## Chapter 8 - Adaptive Timetable Optimization Engine

### 8.1 Purpose

This chapter defines the core optimization engine responsible for generating and continuously improving the student's timetable. Unlike conventional timetable applications that create a fixed schedule, the proposed engine generates a personalized plan and re-optimizes it after every assessment using AI- and ML-derived analytics.

### 8.2 Optimization Goal

Objective:  
Maximize examination readiness while satisfying all scheduling constraints.  
<br/>The planner aims to:  
• Complete the syllabus before the exam.  
• Allocate more time to weak topics.  
• Reduce time for mastered topics.  
• Balance daily workload.  
• Insert revision sessions at appropriate intervals.  
• Continuously adapt after every assessment.

### 8.3 Inputs to the Engine

| Input               | Source          | Purpose              |
| ------------------- | --------------- | -------------------- |
| Subjects & Topics   | Syllabus Module | Planning             |
| Exam Dates          | Calendar        | Remaining days       |
| Daily Study Hours   | User Profile    | Time constraint      |
| Topic Mastery       | ML Engine       | Priority update      |
| Revision Efficiency | ML Engine       | Revision planning    |
| Response Time       | Assessment      | Confidence indicator |
| Skip Count          | Assessment      | Topic avoidance      |
| Forgetting Index    | ML Engine       | Retention planning   |
| Priority Score      | Analytics       | Hour allocation      |

### 8.4 Constraints

Hard Constraints  
• Daily study hours cannot exceed the user-defined limit.  
• All topics should be scheduled before the examination.  
• Revision sessions must occur before the exam.  
<br/>Soft Constraints  
• Avoid excessive workload on any one day.  
• Prefer balanced distribution.  
• Minimize long gaps between revisions.  
• Increase practice for weak topics.

### 8.5 Topic Priority Score

Each topic receives a continuously updated Priority Score.  
<br/>Priority Score depends on:  
• Topic difficulty  
• Exam weight  
• Topic Mastery  
• Response Time  
• Skip Count  
• Revision Efficiency  
• Forgetting Index  
<br/>Higher priority scores result in more allocated study time.

### 8.6 Study Hour Allocation

The planner first computes the total available study hours until the examination.  
<br/>Each topic receives study hours proportional to its priority score.  
<br/>Allocated Hours = (Topic Priority / Sum of All Priorities) × Total Available Study Hours  
<br/>This ensures that higher-priority topics naturally receive greater attention.

### 8.7 Adaptive Rescheduling

After every assessment:  
1\. Update Topic Mastery.  
2\. Recalculate Priority Score.  
3\. Reduce hours for mastered topics.  
4\. Increase hours for weak topics.  
5\. Schedule additional revisions if Revision Efficiency is low.  
6\. Increase priority when Forgetting Index rises.  
7\. Publish updated timetable.

### 8.8 Revision Strategy

The planner does not schedule revisions at fixed intervals.  
<br/>Instead, revisions depend on:  
• Previous score  
• Revision Efficiency  
• Forgetting Index  
• Time remaining until examination  
<br/>Topics with declining retention receive earlier revision sessions.

### 8.9 Behaviour-Aware Scheduling

Learning behaviour influences planning.  
<br/>Examples:  
• Fast and correct answers → reduce future study time.  
• Slow but correct answers → include timed practice.  
• High skip frequency → increase priority.  
• Poor revision improvement → recommend additional revision and concept review.

### 8.10 Timetable Validation

| Metric                     | Purpose                                |
| -------------------------- | -------------------------------------- |
| Syllabus Coverage          | Ensure all topics are planned          |
| Daily Workload Balance     | Avoid overloaded schedules             |
| Priority Satisfaction      | High-priority topics receive more time |
| Revision Completion        | Track planned vs completed revisions   |
| Exam Readiness Improvement | Measure benefit of adaptation          |
| Learning Improvement       | Compare quiz performance over time     |

### 8.11 Scheduling Algorithm (Pseudo Workflow)

Step 1: Read syllabus and exam dates.  
Step 2: Calculate remaining study hours.  
Step 3: Compute Priority Score for every topic.  
Step 4: Allocate study hours proportionally.  
Step 5: Insert revision sessions.  
Step 6: Publish initial timetable.  
Step 7: After each assessment, update ML predictions.  
Step 8: Recalculate priorities.  
Step 9: Reallocate remaining study hours.  
Step 10: Display updated timetable.

### 8.12 Complexity & Scalability

The planner processes topics independently and can easily scale to additional subjects. Since scheduling is based on computed priorities rather than exhaustive search, the approach remains efficient for typical academic workloads. Future versions can replace the heuristic scheduler with optimization techniques such as Constraint Satisfaction or Genetic Algorithms without changing the surrounding architecture.

### 8.13 Design Decisions

• Personalized scheduling instead of one-size-fits-all planning.  
• Continuous adaptation rather than static timetables.  
• Behaviour-aware optimization using ML outputs.  
• Validation through measurable scheduling metrics instead of subjective judgement.

### 8.14 Chapter Summary

This chapter defines the optimization engine that converts ML predictions into a continuously improving study timetable. The next chapter will focus on the Assessment and Evaluation Engine, detailing question presentation, timing, scoring, answer evaluation and performance data collection.