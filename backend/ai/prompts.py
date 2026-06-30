def build_syllabus_extraction_prompt(raw_text: str) -> str:
    return f"""
    You are an intelligent syllabus extraction engine.
    I am giving you raw text parsed from a university syllabus document (via OCR or PDF parser).
    Your job is to identify all the educational "Topics" listed, estimate their difficulty (1 to 5), and estimate the hours required to study them.

    Guidelines:
    1. A single "Unit" usually contains multiple specific topics (e.g. "Merge Sort", "Quick Sort"). Break down large units into distinct logical topics.
    2. Difficulty should be based on technical complexity (1 = Easy, 5 = Very Hard).
    3. Estimated hours should generally be between 1.0 and 4.0 for a single topic.

    Return the response STRICTLY as a JSON array in the following exact format with no markdown blocks and no conversational text:
    [
      {{"topic_name": "Merge Sort", "difficulty_weight": 3.0, "estimated_hours": 2.5}},
      {{"topic_name": "Quick Sort", "difficulty_weight": 4.0, "estimated_hours": 3.0}}
    ]

    Raw Syllabus Text:
    {raw_text}
    """
