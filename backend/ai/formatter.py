"""
Formatter module: Standardizes and cleans AI-generated content
before it is stored in the database or returned to the frontend.
"""

def format_question(raw_q: dict) -> dict:
    """Standardize a question dict with default values for missing fields."""
    return {
        "question_text": str(raw_q.get("question_text", "")).strip(),
        "option_a": str(raw_q.get("option_a", "")).strip(),
        "option_b": str(raw_q.get("option_b", "")).strip(),
        "option_c": str(raw_q.get("option_c", "")).strip(),
        "option_d": str(raw_q.get("option_d", "")).strip(),
        "correct_option": str(raw_q.get("correct_option", "A")).strip().upper(),
        "explanation": str(raw_q.get("explanation", "")).strip(),
        "difficulty": _normalize_difficulty(raw_q.get("difficulty", "Medium")),
        "topic": str(raw_q.get("topic", "")).strip(),
    }

def format_questions(raw_questions: list) -> list:
    """Format a list of question dicts."""
    return [format_question(q) for q in raw_questions]

def format_topic(raw_t: dict) -> dict:
    """Standardize a topic dict with safe type coercion."""
    return {
        "topic_name": str(raw_t.get("topic_name", "Unknown")).strip(),
        "difficulty_weight": _safe_float(raw_t.get("difficulty_weight", 2.0), 1.0, 5.0),
        "estimated_hours": _safe_float(raw_t.get("estimated_hours", 2.0), 0.5, 20.0),
    }

def format_topics(raw_topics: list) -> list:
    """Format a list of topic dicts."""
    return [format_topic(t) for t in raw_topics]

def format_flashcard(raw_card: dict) -> dict:
    """Standardize a flashcard dict."""
    return {
        "front": str(raw_card.get("front", "")).strip(),
        "back": str(raw_card.get("back", "")).strip(),
    }

def format_flashcards(raw_cards: list) -> list:
    """Format a list of flashcard dicts."""
    return [format_flashcard(c) for c in raw_cards]

def _normalize_difficulty(value) -> str:
    """Normalize difficulty to Easy/Medium/Hard."""
    v = str(value).strip().lower()
    if v in ("easy", "e", "1"):
        return "Easy"
    elif v in ("hard", "h", "difficult", "3"):
        return "Hard"
    return "Medium"

def _safe_float(value, min_val: float, max_val: float) -> float:
    """Safely convert to float and clamp within range."""
    try:
        f = float(value)
        return max(min_val, min(max_val, f))
    except (ValueError, TypeError):
        return (min_val + max_val) / 2
