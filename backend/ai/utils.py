import requests
import json
import pypdf
from fastapi import HTTPException

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3" # Default to llama3, could be configurable

def ask_ollama(prompt: str, expect_json: bool = True) -> dict:
    try:
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }
        if expect_json:
            payload["format"] = "json"
            
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        if expect_json:
            return json.loads(data["response"])
        return data["response"]
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Ollama is not running or unreachable at localhost:11434")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")

def generate_quiz_for_topic(topic_name: str, num_questions: int = 3):
    prompt = f"""
    Generate a multiple-choice quiz about '{topic_name}' with {num_questions} questions.
    Return ONLY a valid JSON object with a single key 'questions' containing an array of objects.
    Each question object must exactly have these keys:
    - question_text (string)
    - option_a (string)
    - option_b (string)
    - option_c (string)
    - option_d (string)
    - correct_option (string, MUST be 'A', 'B', 'C', or 'D')
    - explanation (string, explaining the correct answer)
    - difficulty (string, either 'Easy', 'Medium', or 'Hard')
    """
    
    result = ask_ollama(prompt)
    if "questions" not in result:
        raise HTTPException(status_code=500, detail="Ollama returned malformed JSON missing 'questions' array.")
    return result["questions"]

def extract_topics_from_pdf(file_path: str):
    # 1. Read PDF text
    try:
        reader = pypdf.PdfReader(file_path)
        text = ""
        # Read up to the first 5 pages to avoid massive prompts for MVP
        for i in range(min(5, len(reader.pages))):
            text += reader.pages[i].extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF contains no readable text.")

    # 2. Ask Ollama to extract
    prompt = f"""
    Extract the main learning topics from the following syllabus text.
    Return ONLY a valid JSON object with a key 'topics' containing an array of objects.
    Each topic object must have:
    - topic_name (string, concise)
    - difficulty_weight (float between 1.0 and 5.0)
    - estimated_hours (float between 0.5 and 10.0, estimating time to learn)
    
    Syllabus Text:
    {text[:2000]} # Limit text to avoid context overflow in basic models
    """
    
    result = ask_ollama(prompt)
    if "topics" not in result:
        raise HTTPException(status_code=500, detail="Ollama returned malformed JSON missing 'topics' array.")
    return result["topics"]
