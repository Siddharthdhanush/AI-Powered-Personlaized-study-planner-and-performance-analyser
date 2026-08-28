from . import llm_client

def generate_explanation(topic_name: str, concept: str = None) -> str:
    """
    Generates a detailed explanation for a topic or specific concept using centralized vLLM.
    """
    target = f'the concept "{concept}" within the topic "{topic_name}"' if concept else f'the topic "{topic_name}"'
    
    prompt = f"""
    You are an experienced university professor.
    Provide a clear, detailed explanation for {target}.
    
    Your explanation should:
    1. Start with a simple definition.
    2. Explain the core concept step by step.
    3. Provide a real-world analogy or example.
    4. Mention common misconceptions if any.
    5. Be 200-400 words long.
    
    Return ONLY the explanation text, no JSON formatting.
    """
    
    result = llm_client.generate_text(prompt, feature="explanation")
    
    if result and isinstance(result, str):
        return result.strip()
    
    return "Unable to generate explanation at this time. Please try again."
