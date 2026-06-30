from . import ollama_client

def generate_hints(topic_name: str, num_hints: int = 3) -> list:
    """
    Generates study hints/tips for a topic using Llama 3.
    """
    prompt = f"""
    You are an experienced university professor helping students study effectively.
    Generate {num_hints} practical study hints/tips for the topic: "{topic_name}".
    
    Each hint should be a short, actionable piece of advice that helps a student
    understand or remember the topic better.
    
    Return the response STRICTLY as a JSON array of strings:
    ["Hint 1 text...", "Hint 2 text...", "Hint 3 text..."]
    """
    
    result = ollama_client.get_llama3_response(prompt, json_format=True)
    
    if isinstance(result, list):
        return result
    
    print(f"Hint generation returned unexpected type: {type(result)}")
    return []
