from . import llm_client

def generate_flashcards(topic_name: str, num_cards: int = 5) -> list:
    """
    Generates flashcards for a topic using centralized vLLM.
    """
    prompt = f"""
    You are an experienced university professor creating study flashcards.
    Generate {num_cards} flashcards for the topic: "{topic_name}".
    
    Each flashcard should have a front (question/term) and back (answer/definition).
    
    Return the response STRICTLY as a JSON array in this exact format:
    [
      {{"front": "What is ...?", "back": "It is ..."}},
      {{"front": "Define ...", "back": "..."}}
    ]
    """
    
    result = llm_client.generate_json(prompt, feature="flashcard")
    
    if isinstance(result, list):
        return result
    
    print(f"Flashcard generation returned unexpected type: {type(result)}")
    return []
