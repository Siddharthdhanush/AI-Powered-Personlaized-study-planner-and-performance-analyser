from . import ollama_client, prompts

def extract_syllabus_topics(raw_text: str) -> list:
    """
    Sends the raw syllabus text to Llama 3 to structure it into JSON topics.
    """
    prompt = prompts.build_syllabus_extraction_prompt(raw_text)
    
    # Send to Ollama (ollama_client now auto-unwraps dict->list)
    structured_json = ollama_client.get_llama3_response(prompt, json_format=True)
    
    # If it's a valid list of topics, return them
    if isinstance(structured_json, list):
        return structured_json
    
    # If it's still a dict (e.g. error response), return empty
    print(f"Syllabus extraction returned unexpected type: {type(structured_json)}: {str(structured_json)[:200]}")
    return []

