import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"

class Settings(BaseSettings):
    PROJECT_NAME: str = "National Cyber Incident Analytics Platform (NCRI)"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ncri_db")
    FALLBACK_SQLITE_URL: str = f"sqlite:///{BASE_DIR / 'ncri.db'}"
    
    # Sync Schedule
    SYNC_SCHEDULE_HOURS: int = 12
    
    # Risk Engine Configuration
    NCRI_METHODOLOGY_VERSION: str = "v1.0.0"
    NCRI_WEIGHT_FREQUENCY: float = 0.35
    NCRI_WEIGHT_SEVERITY: float = 0.30
    NCRI_WEIGHT_CRITICALITY: float = 0.20
    NCRI_WEIGHT_EXPLOITATION: float = 0.15
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
