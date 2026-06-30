import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import random

# Global models loaded in memory
_mastery_model = None
_readiness_model = None

def generate_mock_data(n_samples=1000):
    """
    Generates realistic mock assessment data for training.
    """
    data = []
    for _ in range(n_samples):
        # Features
        mcq_accuracy = round(random.uniform(20.0, 100.0), 2)
        avg_response_time = round(random.uniform(10.0, 120.0), 2) # seconds
        skip_count = random.randint(0, 10)
        
        # Mastery logic (Heuristic base for the mock labels)
        if mcq_accuracy > 80 and avg_response_time < 45 and skip_count < 2:
            topic_mastery = "Strong"
        elif mcq_accuracy > 50 and skip_count < 5:
            topic_mastery = "Moderate"
        else:
            topic_mastery = "Weak"
            
        # Exam readiness probability (0 to 1)
        # High accuracy, low skips, low time = high probability
        base_prob = (mcq_accuracy / 100.0) * 0.6 + (1 - (skip_count/10.0)) * 0.2 + (1 - (min(avg_response_time, 120)/120.0)) * 0.2
        # Add some noise
        exam_readiness = max(0.0, min(1.0, base_prob + random.uniform(-0.1, 0.1)))
        
        # Discretize readiness for logistic regression target (Pass > 0.6)
        passed_exam = 1 if exam_readiness > 0.6 else 0
        
        data.append([mcq_accuracy, avg_response_time, skip_count, topic_mastery, passed_exam])
        
    df = pd.DataFrame(data, columns=['mcq_accuracy', 'avg_response_time', 'skip_count', 'topic_mastery', 'passed_exam'])
    return df

def initialize_models():
    """
    Trains the scikit-learn models using the mock dataset.
    This simulates an ML pipeline pulling from a data warehouse.
    """
    global _mastery_model, _readiness_model
    
    print("Initializing ML Pipeline... Generating Mock Data...")
    df = generate_mock_data(1000)
    
    X = df[['mcq_accuracy', 'avg_response_time', 'skip_count']]
    
    # 1. Topic Mastery Model (Decision Tree)
    y_mastery = df['topic_mastery']
    _mastery_model = DecisionTreeClassifier(max_depth=4, random_state=42)
    _mastery_model.fit(X, y_mastery)
    
    # 2. Exam Readiness Model (Logistic Regression)
    y_readiness = df['passed_exam']
    _readiness_model = LogisticRegression(random_state=42)
    _readiness_model.fit(X, y_readiness)
    
    print("ML Models trained successfully!")

def predict_performance(mcq_accuracy: float, avg_response_time: float, skip_count: int):
    """
    Takes live student assessment metrics and outputs predictions.
    """
    if _mastery_model is None or _readiness_model is None:
        initialize_models()
        
    # Feature vector shape (1, 3)
    features = pd.DataFrame([[mcq_accuracy, avg_response_time, skip_count]], 
                           columns=['mcq_accuracy', 'avg_response_time', 'skip_count'])
    
    mastery_pred = _mastery_model.predict(features)[0]
    
    # Get probability of class 1 (Passed)
    readiness_prob = _readiness_model.predict_proba(features)[0][1]
    
    return {
        "topic_mastery": mastery_pred,
        "exam_readiness_prob": round(readiness_prob, 2)
    }
