from . import llm_client

def ask_ollama(prompt: str, expect_json: bool = True) -> dict:
    """
    Legacy wrapper delegating to centralized llm_client.
    """
    if expect_json:
        res = llm_client.generate_json(prompt, feature="general")
        if isinstance(res, dict):
            return res
        return {"data": res}
    return llm_client.generate_text(prompt, feature="general")

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
    
    result = llm_client.generate_json(prompt, feature="quiz")
    if isinstance(result, list):
        return result
    if isinstance(result, dict) and "questions" in result:
        return result["questions"]
    raise HTTPException(status_code=500, detail="vLLM returned malformed JSON missing 'questions' array.")

def extract_topics_from_pdf(file_path: str):
    # 1. Read PDF text
    try:
        reader = pypdf.PdfReader(file_path)
        text = ""
        for i in range(min(5, len(reader.pages))):
            text += reader.pages[i].extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF contains no readable text.")

    # 2. Ask vLLM to extract
    prompt = f"""
    Extract the main learning topics from the following syllabus text.
    Return ONLY a valid JSON object with a key 'topics' containing an array of objects.
    Each topic object must have:
    - topic_name (string, concise)
    - difficulty_weight (float between 1.0 and 5.0)
    - estimated_hours (float between 0.5 and 10.0, estimating time to learn)
    
    Syllabus Text:
    {text[:2000]}
    """
    
    result = llm_client.generate_json(prompt, feature="syllabus")
    if isinstance(result, list):
        return result
    if isinstance(result, dict) and "topics" in result:
        return result["topics"]
    raise HTTPException(status_code=500, detail="vLLM returned malformed JSON missing 'topics' array.")

def get_semantic_context(document_text: str, topic_name: str, top_k: int = 3) -> str:
    """
    Chunks the document_text and finds chunks containing the keyword (topic_name).
    """
    if not document_text or not document_text.strip():
        return ""
    
    words = document_text.split()
    chunks = []
    chunk_size = 120  # ~600-800 characters
    overlap = 30
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
            
    if not chunks:
        return ""
        
    matched_chunks = []
    topic_lower = topic_name.lower()
    for chunk in chunks:
        if topic_lower in chunk.lower():
            matched_chunks.append(chunk)
            
    if matched_chunks:
        return "\n\n...[Context Section]...\n" + "\n\n".join(matched_chunks[:top_k])
    
    return ""

