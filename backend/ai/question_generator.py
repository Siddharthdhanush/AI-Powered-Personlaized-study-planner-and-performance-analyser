from . import llm_client, prompts

def generate_quiz_for_topic(topic_name: str, num_questions: int = 10, context: str = None) -> list:
    """
    Sends a request to Llama 3 to generate a quiz for the topic.
    Generates exactly 10 questions: 4 MCQ, 3 MULTI_MCQ, and 3 DESCRIPTIVE.
    Utilizes Bloom's Taxonomy, plausible distractors, and few-shot examples.
    """
    context_section = ""
    if context:
        context_section = f"""
SOURCE STUDY MATERIAL (CONTEXT):
Use ONLY the following text as the factual base for generating the questions:
{context}
"""

    prompt = f"""
You are an experienced university professor.
Generate an academically rigorous, high-standard quiz with exactly 10 questions for the topic: "{topic_name}".

{context_section}

COGNITIVE LEVEL INSTRUCTIONS (BLOOM'S TAXONOMY):
- Easy (4 Questions: 2 MCQ, 1 MULTI_MCQ, 1 DESCRIPTIVE): Test basic concepts, definitions, and comprehension (Remember & Understand).
- Medium (3 Questions: 1 MCQ, 1 MULTI_MCQ, 1 DESCRIPTIVE): Test scenario-based application and analysis (Apply & Analyze). For example, trace a short scenario or perform a calculation.
- Hard (3 Questions: 1 MCQ, 1 MULTI_MCQ, 1 DESCRIPTIVE): Test deep critical evaluation, design trade-offs, debugging, and synthesis (Evaluate & Create). For example, compare multiple approaches under constraints or troubleshoot a scenario.

QUESTION TYPES & SCHEMAS:
1. Multiple Choice Questions (MCQs): question_type = "MCQ". Correct option must be a single letter: A, B, C, or D.
2. Multi-Correct Questions (MULTI_MCQs): question_type = "MULTI_MCQ". Correct option must list multiple letters separated by commas (e.g. "A,B" or "A,C,D").
3. Descriptive Questions: question_type = "DESCRIPTIVE". Set options (a, b, c, d) to null. Correct option must contain the key grading points/model answer.

CRITICAL DISTRACTOR RULE:
Distractors (wrong options A, B, C, D) must NOT be obviously incorrect, silly, or trivial. They must represent highly plausible student misconceptions (e.g., off-by-one error, syntax misuse, or logical pitfalls).

FEW-SHOT EXAMPLES:

Example 1: MCQ (Medium - Application)
{{
  "question_text": "What is the worst-case number of comparisons performed by Merge Sort on an array of size 8?",
  "option_a": "12",
  "option_b": "17",
  "option_c": "24",
  "option_d": "28",
  "correct_option": "B",
  "explanation": "Merge sort on an array of size n performs at most n * ceil(log2(n)) - n + 1 comparisons. For n = 8, 8 * 3 - 8 + 1 = 17.",
  "difficulty": "Medium",
  "question_type": "MCQ"
}}

Example 2: MULTI_MCQ (Hard - Evaluation)
{{
  "question_text": "Which of the following are true regarding the differences between Quick Sort and Merge Sort?",
  "option_a": "Merge Sort is stable, whereas standard Quick Sort is unstable.",
  "option_b": "Merge Sort runs in O(n log n) worst-case time, while Quick Sort runs in O(n^2) worst-case time.",
  "option_c": "Quick Sort has a lower space complexity overhead (in-place) compared to standard Merge Sort.",
  "option_d": "Quick Sort is always faster than Merge Sort for any input array size.",
  "correct_option": "A,B,C",
  "explanation": "Merge sort is stable and guarantees O(n log n) time but requires O(n) auxiliary space. Quick sort is unstable, runs in O(n^2) worst-case, but runs in-place with O(log n) space overhead.",
  "difficulty": "Hard",
  "question_type": "MULTI_MCQ"
}}

Return the response STRICTLY as a JSON array of objects in this exact format (no markdown blocks):
[
  {{
    "question_text": "...",
    "option_a": "choice A text",
    "option_b": "choice B text",
    "option_c": "choice C text",
    "option_d": "choice D text",
    "correct_option": "...",
    "explanation": "...",
    "difficulty": "Easy",
    "question_type": "MCQ"
  }}
]
"""
    
    # Send to Ollama (ollama_client now auto-unwraps dict->list)
    structured_json = llm_client.generate_json(prompt, feature="quiz")
    
    # If it's a valid list of questions, return them
    if isinstance(structured_json, list):
        return structured_json
    
    # If it's still a dict, return empty
    print(f"Quiz generation returned unexpected type: {type(structured_json)}: {str(structured_json)[:200]}")
    return []

def generate_quiz_for_topics_adaptive(topics_list: list[dict]) -> list:
    """
    topics_list is a list of dicts: [{"topic_name": str, "num_questions": int, "content_text": str}]
    Generates questions for each topic adaptively.
    """
    all_generated_questions = []
    
    for t in topics_list:
        topic_name = t["topic_name"]
        num_q = t.get("num_questions", 3)
        context = t.get("content_text")
        if num_q <= 0:
            continue
            
        mcq_count = max(1, num_q // 2)
        multi_mcq_count = max(0, (num_q - mcq_count) // 2)
        desc_count = num_q - mcq_count - multi_mcq_count
        
        context_section = ""
        if context:
            context_section = f"""
SOURCE STUDY MATERIAL (CONTEXT):
Use ONLY the following text as the factual base for generating the questions:
{context}
"""

        prompt = f"""
You are an experienced university professor.
Generate a quiz with exactly {num_q} questions for the topic: "{topic_name}".
        
{context_section}

The quiz MUST contain:
- {mcq_count} Multiple Choice Questions (MCQs): question_type = "MCQ". You MUST provide all four choices (option_a, option_b, option_c, option_d) as non-empty distinct strings. correct_option must be a single letter (A, B, C, or D).
- {multi_mcq_count} Multi-Correct Questions: question_type = "MULTI_MCQ". You MUST provide all four choices (option_a, option_b, option_c, option_d) as non-empty distinct strings. The correct_option MUST contain multiple letters separated by commas (e.g. "A,B") indicating all the correct options.
- {desc_count} Descriptive/Short Answer Questions: question_type = "DESCRIPTIVE". Set option_a, option_b, option_c, option_d to null. correct_option must contain key points or a model answer.
        
CRITICAL RULE FOR OPTIONS:
For all "MCQ" and "MULTI_MCQ" questions, you MUST fill "option_a", "option_b", "option_c", and "option_d" with the actual answers. Under no circumstances should they be null, empty, or missing. They must represent highly plausible distractors.
        
For each question, specify its "difficulty" as "Easy", "Medium", or "Hard".
        
Return the response STRICTLY as a JSON array of objects in this exact format (no markdown blocks):
[
  {{
    "question_text": "...",
    "option_a": "choice A text",
    "option_b": "choice B text",
    "option_c": "choice C text",
    "option_d": "choice D text",
    "correct_option": "...",
    "explanation": "...",
    "difficulty": "Easy",
    "question_type": "MCQ"
  }}
]
"""
        
        structured_json = llm_client.generate_json(prompt, feature="quiz")
        if isinstance(structured_json, list):
            for q in structured_json:
                q["topic_name"] = topic_name
            all_generated_questions.extend(structured_json)
        else:
            print(f"Failed to generate questions for topic: {topic_name}")
            
    return all_generated_questions
