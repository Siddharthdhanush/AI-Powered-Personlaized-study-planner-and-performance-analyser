from . import llm_client

def generate_summary(topic_name: str) -> str:
    """
    Generates a concise study summary for a topic using centralized vLLM.
    """
    prompt = f"""
    You are an experienced university professor creating study material.
    Write a clear, concise study summary for the topic: "{topic_name}".
    
    The summary should:
    1. Be 150-300 words long.
    2. Cover the key concepts, definitions, and important points.
    3. Use simple language suitable for university students.
    4. Include any important formulas or relationships if applicable.
    
    Return ONLY the summary text, no JSON formatting needed.
    """
    
    result = llm_client.generate_text(prompt, feature="summary")
    
    if result and isinstance(result, str):
        return result.strip()
    
    return "Unable to generate summary at this time. Please try again."
