from . import ollama_client, prompts

def generate_quiz_for_topic(topic_name: str, num_questions: int = 9) -> list:
    """
    Sends a request to Llama 3 to generate a quiz for the topic.
    Generates exactly 9 questions with a mix of MCQ, FIB, and Descriptive types.
    """
    prompt = f"""
    You are an experienced university professor.
    Generate a quiz with exactly 9 questions for the topic: "{topic_name}".
    
    The quiz MUST contain a mix of different question types:
    - 3 Multiple Choice Questions (MCQs): question_type = "MCQ". Must have options (option_a, option_b, option_c, option_d) and a correct_option (A, B, C, or D).
    - 3 Fill in the Blanks (FIB): question_type = "FIB". The question_text must contain a blank (e.g. "___"). Set option_a, option_b, option_c, option_d to null. correct_option must contain the single correct word/phrase answer.
    - 3 Descriptive/Short Answer Questions: question_type = "DESCRIPTIVE". Set option_a, option_b, option_c, option_d to null. correct_option must contain the key points or a model answer.
    
    Difficulty distribution:
    - 3 Easy (1 MCQ, 1 FIB, 1 DESCRIPTIVE)
    - 3 Medium (1 MCQ, 1 FIB, 1 DESCRIPTIVE)
    - 3 Hard (1 MCQ, 1 FIB, 1 DESCRIPTIVE)
    
    Return the response STRICTLY as a JSON array of objects in this exact format (no markdown blocks):
    [
      {{
        "question_text": "...",
        "option_a": "...",
        "option_b": "...",
        "option_c": "...",
        "option_d": "...",
        "correct_option": "...",
        "explanation": "...",
        "difficulty": "Easy",
        "question_type": "MCQ"
      }}
    ]
    """
    
    # Send to Ollama (ollama_client now auto-unwraps dict->list)
    structured_json = ollama_client.get_llama3_response(prompt, json_format=True)
    
    # If it's a valid list of questions, return them
    if isinstance(structured_json, list):
        return structured_json
    
    # If it's still a dict, return empty
    print(f"Quiz generation returned unexpected type: {type(structured_json)}: {str(structured_json)[:200]}")
    return []
