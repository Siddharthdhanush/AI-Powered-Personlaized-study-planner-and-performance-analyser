from . import ollama_client

def generate_study_strategy(topic_names: list, days_until_exam: int, hours_per_day: float = 3.0) -> dict:
    """
    Generates a personalized study strategy based on topics and time available.
    """
    topics_str = ", ".join(topic_names)
    
    prompt = f"""
    You are an expert academic advisor helping a student prepare for an exam.
    
    The student needs to study these topics: {topics_str}
    Days until exam: {days_until_exam}
    Available study hours per day: {hours_per_day}
    
    Create a personalized study strategy. Include:
    1. A recommended study order (which topics to tackle first and why).
    2. Time allocation per topic (in hours).
    3. Suggested study techniques for each topic (e.g., active recall, spaced repetition, practice problems).
    4. A daily study schedule outline.
    5. Tips for revision in the final days.
    
    Return the response as JSON:
    {{
      "strategy_summary": "Brief overall strategy description",
      "topic_order": ["Topic1", "Topic2"],
      "time_allocation": [{{"topic": "Topic1", "hours": 5, "technique": "Active recall + practice problems"}}],
      "daily_plan": [{{"day": 1, "focus": "Topic1", "activities": "Read chapter, solve 10 problems"}}],
      "revision_tips": ["Tip 1", "Tip 2"],
      "motivation": "A short motivational message"
    }}
    """
    
    result = ollama_client.get_llama3_response(prompt, json_format=True)
    
    if isinstance(result, dict) and "strategy_summary" in result:
        return result
    if isinstance(result, dict):
        return result
    
    return {
        "strategy_summary": "Unable to generate strategy. Please try again.",
        "topic_order": topic_names,
        "time_allocation": [],
        "daily_plan": [],
        "revision_tips": [],
        "motivation": "Keep studying! You've got this!"
    }
