"""
Shiftbase - Application Configuration
Loads settings from .env file and environment variables.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
from dotenv import load_dotenv

# Load .env from project root (two levels up from this file)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")


class Settings(BaseSettings):
    """Central configuration for the Shiftbase application."""

    # ── Application ──
    app_name: str = "shiftbase"
    app_version: str = "1.0.0"
    debug: bool = Field(default=True, alias="DEBUG")

    # ── Server ──
    backend_host: str = Field(default="0.0.0.0", alias="BACKEND_HOST")
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")
    backend_cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        alias="BACKEND_CORS_ORIGINS"
    )

    # ── Database ──
    database_path: str = Field(
        default=str(PROJECT_ROOT / "data" / "shiftbase.db"),
        alias="DATABASE_PATH"
    )

    # ── AI Provider ──
    ai_provider: str = Field(default="gemini", alias="AI_PROVIDER")
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    ollama_base_url: str = Field(
        default="http://localhost:11434",
        alias="OLLAMA_BASE_URL"
    )
    ollama_model: str = Field(default="llama3", alias="OLLAMA_MODEL")

    # ── Security ──
    secret_key: str = Field(
        default="shiftbase-dev-secret-key-change-in-production",
        alias="SECRET_KEY"
    )

    # ── Supported Transformations ──
    supported_transformations: List[str] = [
        "split_string",
        "concat_fields",
        "format_date",
        "uppercase",
        "lowercase",
        "trim",
        "to_integer",
        "to_float",
        "to_string",
        "default_value",
        "truncate",
        "direct_copy",
    ]

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [
            origin.strip()
            for origin in self.backend_cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def db_absolute_path(self) -> str:
        """Resolve the database path to an absolute path."""
        db_path = Path(self.database_path)
        if not db_path.is_absolute():
            db_path = (Path(__file__).resolve().parent / db_path).resolve()
        return str(db_path)

    class Config:
        env_file = str(PROJECT_ROOT / ".env")
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


# Singleton instance used across the application
settings = Settings()