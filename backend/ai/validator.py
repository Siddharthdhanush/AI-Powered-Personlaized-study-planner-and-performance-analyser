"""
Validator module: Validates AI-generated content before it reaches the database.
Ensures structural integrity of all AI responses.
"""

def validate_question(q: dict) -> bool:
    """Validates a single MCQ question dict has all required fields."""
    required = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option"]
    for field in required:
        if field not in q or not q[field]:
            return False
    if q["correct_option"] not in ["A", "B", "C", "D"]:
        return False
    return True

def validate_questions(questions: list) -> list:
    """Filters out invalid questions from a list."""
    return [q for q in questions if validate_question(q)]

def validate_flashcard(card: dict) -> bool:
    """Validates a single flashcard has front and back."""
    return bool(card.get("front")) and bool(card.get("back"))

def validate_flashcards(cards: list) -> list:
    """Filters out invalid flashcards."""
    return [c for c in cards if validate_flashcard(c)]

def validate_topic(topic: dict) -> bool:
    """Validates an extracted topic dict."""
    if not topic.get("topic_name"):
        return False
    try:
        d = float(topic.get("difficulty_weight", 0))
        h = float(topic.get("estimated_hours", 0))
        if d < 0 or d > 10 or h < 0 or h > 100:
            return False
    except (ValueError, TypeError):
        return False
    return True

def validate_topics(topics: list) -> list:
    """Filters out invalid topics."""
    return [t for t in topics if validate_topic(t)]

def validate_hints(hints: list) -> list:
    """Filters out empty/invalid hints."""
    return [h for h in hints if isinstance(h, str) and len(h.strip()) > 5]
