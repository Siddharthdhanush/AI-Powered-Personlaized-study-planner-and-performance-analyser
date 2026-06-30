import ollama
import json

def _unwrap_response(parsed):
    """
    Llama 3 often wraps JSON arrays inside a dict like {"topics": [...]}.
    This unwraps them so callers always get the inner list.
    """
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict):
        # If dict has a single key whose value is a list, unwrap it
        values = list(parsed.values())
        if len(values) == 1 and isinstance(values[0], list):
            return values[0]
        # If dict has any key whose value is a list, use the first list found
        for v in values:
            if isinstance(v, list):
                return v
    return parsed

def get_llama3_response(prompt_text: str, json_format: bool = False):
    """
    Core function to communicate with local Ollama instance running Llama 3.
    """
    messages = [
        {"role": "system", "content": "You are an intelligent educational assistant. Always return valid JSON when asked."},
        {"role": "user", "content": prompt_text}
    ]
    
    kwargs = {
        "model": "llama3",
        "messages": messages,
    }
    
    if json_format:
        kwargs["format"] = "json"
        
    try:
        response = ollama.chat(**kwargs)
        content = response.get("message", {}).get("content", "")
        
        if json_format:
            try:
                # Strip markdown json block if present
                clean_content = content.strip()
                if clean_content.startswith("```json"):
                    clean_content = clean_content[7:]
                elif clean_content.startswith("```"):
                    clean_content = clean_content[3:]
                if clean_content.endswith("```"):
                    clean_content = clean_content[:-3]
                clean_content = clean_content.strip()
                
                parsed = json.loads(clean_content)
                return _unwrap_response(parsed)
            except json.JSONDecodeError as e:
                print(f"JSON parse error: {e}. Raw content: {content[:200]}")
                return {"error": "Llama 3 returned invalid JSON", "raw_content": content}
                
        return content
    except Exception as e:
        print(f"Ollama connection error: {e}")
        return None
