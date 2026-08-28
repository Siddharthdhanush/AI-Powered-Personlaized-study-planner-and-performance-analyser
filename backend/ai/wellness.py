from . import llm_client

def generate_wellness_tip(study_hours_today: float = 0, days_until_exam: int = 7) -> dict:
    """
    Generates personalized wellness and mental health tips for students using centralized vLLM.
    """
    prompt = f"""
    You are a supportive student wellness advisor.
    
    Context:
    - The student has studied approximately {study_hours_today} hours today.
    - Their exam is in {days_until_exam} days.
    
    Generate a personalized wellness recommendation. Include:
    1. A wellness tip related to their current study load.
    2. A short motivational quote.
    3. A suggested break activity (2-5 minutes).
    4. A reminder about physical health (hydration, posture, sleep).
    
    Return as JSON:
    {{
      "wellness_tip": "...",
      "motivation_quote": "...",
      "break_activity": "...",
      "health_reminder": "...",
      "mood_emoji": "one emoji representing the recommended mood"
    }}
    """
    
    result = llm_client.generate_json(prompt, feature="wellness")
    
    if isinstance(result, dict) and "wellness_tip" in result:
        return result
    if isinstance(result, dict):
        return result
    
    return {
        "wellness_tip": "Take regular breaks every 45 minutes to maintain focus.",
        "motivation_quote": "The expert in anything was once a beginner.",
        "break_activity": "Stand up, stretch, and take 10 deep breaths.",
        "health_reminder": "Stay hydrated! Drink a glass of water now.",
        "mood_emoji": "😊"
    }
