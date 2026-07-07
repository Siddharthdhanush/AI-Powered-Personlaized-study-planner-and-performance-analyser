from . import ollama_client, prompts

def generate_quiz_for_topic(topic_name: str, num_questions: int = 10) -> list:
    """
    Sends a request to Llama 3 to generate a quiz for the topic.
    Generates exactly 10 questions: 4 MCQ, 3 MULTI_MCQ, and 3 DESCRIPTIVE.
    """
    prompt = f"""
    You are an experienced university professor.
    Generate a quiz with exactly 10 questions for the topic: "{topic_name}".
    
    The quiz MUST contain a mix of different question types:
    - 4 Multiple Choice Questions (MCQs): question_type = "MCQ". You MUST provide all four choices (option_a, option_b, option_c, option_d) as non-empty distinct strings. correct_option must be a single letter (A, B, C, or D).
    - 3 Multi-Correct Questions: question_type = "MULTI_MCQ". You MUST provide all four choices (option_a, option_b, option_c, option_d) as non-empty distinct strings. The correct_option MUST contain multiple letters separated by commas (e.g. "A,B" or "A,C,D") indicating all the correct options.
    - 3 Descriptive/Short Answer Questions: question_type = "DESCRIPTIVE". Set option_a, option_b, option_c, option_d to null. correct_option must contain the key points or a model answer.
    
    CRITICAL RULE FOR OPTIONS:
    For all "MCQ" and "MULTI_MCQ" questions, you MUST fill "option_a", "option_b", "option_c", and "option_d" with the actual answers. Under no circumstances should they be null, empty, or missing.
    
    Difficulty distribution:
    - 4 Easy (2 MCQ, 1 MULTI_MCQ, 1 DESCRIPTIVE)
    - 3 Medium (1 MCQ, 1 MULTI_MCQ, 1 DESCRIPTIVE)
    - 3 Hard (1 MCQ, 1 MULTI_MCQ, 1 DESCRIPTIVE)
    
    Return the response STRICTLY as a JSON array of objects in this exact format (no markdown blocks):
    [
      {{
        "question_text": "...",
        "option_a": "choice A text",
        "option_b": "choice B text",
        "option_c": "choice C text",
        "option_d": "choice D text",
        "correct_option": "...", // e.g. "A" for MCQ, "A,C" for MULTI_MCQ, model answer for DESCRIPTIVE
        "explanation": "...",
        "difficulty": "Easy",
        "question_type": "MCQ" // MCQ, MULTI_MCQ, DESCRIPTIVE
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

def generate_quiz_for_topics_adaptive(topics_list: list[dict]) -> list:
    """
    topics_list is a list of dicts: [{"topic_name": str}]
    Generates questions for each topic, letting the LLM decide the count adaptively based on complexity.
    """
    all_generated_questions = []
    
    for t in topics_list:
        topic_name = t["topic_name"]
        
        prompt = f"""
        You are an experienced university professor.
        Analyze the complexity and depth of the topic: "{topic_name}".
        
        Dynamically determine the appropriate number of questions needed to comprehensively test a university student on this topic (typically between 5 and 15 questions, depending on the depth of the material).
        
        Generate that decided number of questions, ensuring:
        1. A balanced mix of difficulty levels ("Easy", "Medium", and "Hard") across the questions.
        2. A mix of question types:
           - Multiple Choice Questions (MCQs): question_type = "MCQ". You MUST provide all four choices (option_a, option_b, option_c, option_d) as non-empty distinct strings. correct_option must be a single letter (A, B, C, or D).
           - Multi-Correct Questions: question_type = "MULTI_MCQ". You MUST provide all four choices (option_a, option_b, option_c, option_d) as non-empty distinct strings. The correct_option MUST contain multiple letters separated by commas (e.g. "A,B") indicating all the correct options.
           - Descriptive/Short Answer Questions: question_type = "DESCRIPTIVE". Set option_a, option_b, option_c, option_d to null. correct_option must contain key points or a model answer.
        
        CRITICAL RULE FOR OPTIONS:
        For all "MCQ" and "MULTI_MCQ" questions, you MUST fill "option_a", "option_b", "option_c", and "option_d" with the actual answers. Under no circumstances should they be null, empty, or missing.
        
        For each question, specify its "difficulty" as "Easy", "Medium", or "Hard".
        
        Return the response STRICTLY as a JSON array of objects in this exact format (no markdown blocks):
        [
          {{
            "question_text": "...",
            "option_a": "choice A text",
            "option_b": "choice B text",
            "option_c": "choice C text",
            "option_d": "choice D text",
            "correct_option": "...",
            "explanation": "...",
            "difficulty": "Easy",
            "question_type": "MCQ"
          }}
        ]
        """
        
        structured_json = ollama_client.get_llama3_response(prompt, json_format=True)
        if isinstance(structured_json, list):
            for q in structured_json:
                q["topic_name"] = topic_name
            all_generated_questions.extend(structured_json)
        else:
            print(f"Failed to generate questions for topic: {topic_name}")
            
    return all_generated_questions
