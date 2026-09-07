import os
from pathlib import Path
from pydantic_settings import BaseSettings

_env_path = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./aiml_system.db"
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # LLM Inference Configuration (vLLM OpenAI-Compatible API)
    LLM_BASE_URL: str = "http://localhost:8000/v1"
    LLM_API_KEY: str = "EMPTY"
    LLM_MODEL: str = "meta-llama/Llama-3.2-1B-Instruct"
    LLM_TIMEOUT: float = 60.0
    LLM_MAX_RETRIES: int = 3

    class Config:
        env_file = str(_env_path)
        env_file_encoding = "utf-8"

settings = Settings()
