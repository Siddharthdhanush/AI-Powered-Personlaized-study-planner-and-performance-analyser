import json
import time
import logging
from typing import Any, Dict, List, Union, Optional
from openai import OpenAI
from backend.core.config import settings

logger = logging.getLogger("llm_client")
logging.basicConfig(level=logging.INFO)

# Global Telemetry Counter for Admin Orchestrator
_telemetry_data = {
    "total_requests": 0,
    "successful_requests": 0,
    "failed_requests": 0,
    "last_latency_seconds": 0.0,
    "feature_counts": {
        "quiz": 0,
        "syllabus": 0,
        "explanation": 0,
        "hint": 0,
        "summary": 0,
        "flashcard": 0,
        "mocktest": 0,
        "wellness": 0,
        "study_strategy": 0,
        "general": 0
    }
}

import subprocess

_cached_vllm_base_url = None

def get_active_vllm_url() -> str:
    """
    Returns configured LLM_BASE_URL, or automatically falls back to WSL2 eth0 IP if localhost is unreachable.
    """
    global _cached_vllm_base_url
    if _cached_vllm_base_url:
        return _cached_vllm_base_url

    base_url = settings.LLM_BASE_URL
    try:
        import urllib.request
        req = urllib.request.Request(f"{base_url}/models")
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                _cached_vllm_base_url = base_url
                return base_url
    except Exception:
        pass

    # Fallback: Detect WSL2 eth0 IP dynamically
    try:
        res = subprocess.run(["wsl", "ip", "addr", "show", "eth0"], capture_output=True, text=True, timeout=2)
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                if "inet " in line:
                    ip = line.strip().split()[1].split("/")[0]
                    wsl_url = f"http://{ip}:8000/v1"
                    try:
                        req = urllib.request.Request(f"{wsl_url}/models")
                        with urllib.request.urlopen(req, timeout=1.5) as resp:
                            if resp.status == 200:
                                _cached_vllm_base_url = wsl_url
                                logger.info(f"Auto-detected active vLLM server on WSL2 IP: {wsl_url}")
                                return wsl_url
                    except Exception:
                        pass
    except Exception as e:
        logger.debug(f"WSL IP auto-discovery failed: {e}")

    return base_url

def _get_openai_client() -> OpenAI:
    """
    Initializes standard OpenAI client pointed to centralized vLLM server.
    """
    active_url = get_active_vllm_url()
    return OpenAI(
        base_url=active_url,
        api_key=settings.LLM_API_KEY,
        timeout=settings.LLM_TIMEOUT,
        max_retries=settings.LLM_MAX_RETRIES
    )

def _unwrap_response(parsed: Any) -> Any:
    """
    Llama 3 / vLLM often wraps JSON arrays inside a dict like {"topics": [...]}.
    This unwraps them so callers always get the inner list.
    """
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict):
        values = list(parsed.values())
        if len(values) == 1 and isinstance(values[0], list):
            return values[0]
        for v in values:
            if isinstance(v, list):
                return v
    return parsed

def get_llm_telemetry() -> Dict[str, Any]:
    """
    Returns telemetry metrics for the Admin Orchestrator Dashboard.
    """
    return {
        "total_requests": _telemetry_data["total_requests"],
        "successful_requests": _telemetry_data["successful_requests"],
        "failed_requests": _telemetry_data["failed_requests"],
        "last_latency_seconds": round(_telemetry_data["last_latency_seconds"], 3),
        "feature_counts": dict(_telemetry_data["feature_counts"])
    }

def check_vllm_health() -> Dict[str, Any]:
    """
    Pings the vLLM server base URL to report connection status and model details.
    """
    start_time = time.time()
    try:
        client = _get_openai_client()
        models = client.models.list()
        latency = round(time.time() - start_time, 3)
        available_models = [m.id for m in models.data] if hasattr(models, 'data') else []
        return {
            "status": "online",
            "base_url": settings.LLM_BASE_URL,
            "configured_model": settings.LLM_MODEL,
            "available_models": available_models,
            "latency_seconds": latency,
            "error": None
        }
    except Exception as e:
        return {
            "status": "offline",
            "base_url": settings.LLM_BASE_URL,
            "configured_model": settings.LLM_MODEL,
            "available_models": [],
            "latency_seconds": None,
            "error": str(e)
        }

def generate_chat_completion(
    messages: List[Dict[str, str]],
    json_format: bool = False,
    temperature: float = 0.0,
    max_tokens: int = 2048,
    feature: str = "general"
) -> Union[str, List, Dict]:
    """
    Core function communicating with centralized vLLM OpenAI API.
    Handles telemetry, markdown stripping, and JSON parsing.
    """
    global _telemetry_data
    _telemetry_data["total_requests"] += 1
    if feature in _telemetry_data["feature_counts"]:
        _telemetry_data["feature_counts"][feature] += 1
    else:
        _telemetry_data["feature_counts"]["general"] += 1

    start_time = time.time()
    client = _get_openai_client()

    kwargs = {
        "model": settings.LLM_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }

    if json_format:
        kwargs["response_format"] = {"type": "json_object"}

    try:
        response = client.chat.completions.create(**kwargs)
        content = response.choices[0].message.content or ""
        
        latency = time.time() - start_time
        _telemetry_data["last_latency_seconds"] = latency
        _telemetry_data["successful_requests"] += 1

        if json_format:
            clean_content = content.strip()
            if clean_content.startswith("```json"):
                clean_content = clean_content[7:]
            elif clean_content.startswith("```"):
                clean_content = clean_content[3:]
            if clean_content.endswith("```"):
                clean_content = clean_content[:-3]
            clean_content = clean_content.strip()

            try:
                parsed = json.loads(clean_content)
                return _unwrap_response(parsed)
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error from vLLM: {e}. Raw content snippet: {content[:200]}")
                return {"error": "vLLM returned invalid JSON", "raw_content": content}

        return content.strip()

    except Exception as e:
        _telemetry_data["failed_requests"] += 1
        logger.error(f"vLLM API communication error: {e}")
        return None

def generate_text(prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.0, feature: str = "general") -> str:
    """
    Generates unstructured text response.
    """
    sys_content = system_prompt or "You are an intelligent educational assistant."
    messages = [
        {"role": "system", "content": sys_content},
        {"role": "user", "content": prompt}
    ]
    res = generate_chat_completion(messages, json_format=False, temperature=temperature, feature=feature)
    return str(res) if res else ""

def generate_json(prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.0, feature: str = "general") -> Union[Dict, List]:
    """
    Generates structured JSON object or list response.
    """
    sys_content = system_prompt or "You are an intelligent educational assistant. Always return valid JSON."
    messages = [
        {"role": "system", "content": sys_content},
        {"role": "user", "content": prompt}
    ]
    return generate_chat_completion(messages, json_format=True, temperature=temperature, feature=feature)

# Backward-compatibility wrapper for existing modules expecting get_llama3_response
def get_llama3_response(prompt_text: str, json_format: bool = False, feature: str = "general"):
    """
    Compatibility wrapper mapping existing calls to vLLM client.
    """
    messages = [
        {"role": "system", "content": "You are an intelligent educational assistant. Always return valid JSON when asked."},
        {"role": "user", "content": prompt_text}
    ]
    return generate_chat_completion(messages, json_format=json_format, feature=feature)
