"""
Legacy Ollama Client Compatibility Wrapper.
All calls are automatically routed to the centralized vLLM llm_client abstraction.
"""
from backend.ai.llm_client import get_llama3_response, check_vllm_health, get_llm_telemetry

def unload_model():
    """No-op for vLLM centralized server."""
    pass
