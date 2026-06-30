from . import ollama_client

def generate_mocktest(topic_names: list, num_questions: int = 10) -> list:
    """
    Generates a full mock test across multiple topics using Llama 3.
    Returns a mix of easy, medium, and hard MCQs.
    """
    topics_str = ", ".join(topic_names)
    
    prompt = f"""
    You are an experienced university professor creating a mock exam.
    Generate a mock test with {num_questions} Multiple Choice Questions (MCQs) covering these topics: {topics_str}.
    
    Rules:
    1. Mix difficulty levels: approximately 30% Easy, 40% Medium, 30% Hard.
    2. Spread questions evenly across the given topics.
    3. Each question should test understanding, not just memorization.
    
    Return the response STRICTLY as a JSON array:
    [
      {{
        "question_text": "...",
        "option_a": "...",
        "option_b": "...",
        "option_c": "...",
        "option_d": "...",
        "correct_option": "A",
        "explanation": "...",
        "difficulty": "Easy",
        "topic": "..."
      }}
    ]
    """
    
    result = ollama_client.get_llama3_response(prompt, json_format=True)
    
    if isinstance(result, list):
        return result
    
    print(f"Mock test generation returned unexpected type: {type(result)}")
    return []
