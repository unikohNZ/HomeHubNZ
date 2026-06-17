from functools import lru_cache

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


def to_async_database_url(url: str) -> str:
    """Convert a standard PostgreSQL URL to the asyncpg driver form."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "HomeHub NZ"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql://homehub:homehub123@localhost:5432/homehub_db"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Supabase Storage (optional — falls back to local disk in dev)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "homehub-uploads"

    # Local uploads (development) — also used when Supabase is not configured
    UPLOAD_DIR: str = "uploads"
    PUBLIC_BASE_URL: str = "http://127.0.0.1:8000"

    # AWS S3 (production — optional)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-southeast-2"
    S3_BUCKET_NAME: str = ""
    USE_S3: bool = False

    # Expo push (optional)
    EXPO_ACCESS_TOKEN: str = ""

    @computed_field  # type: ignore[prop-decorator]
    @property
    def async_database_url(self) -> str:
        return to_async_database_url(self.DATABASE_URL)


@lru_cache
def get_settings() -> Settings:
    return Settings()
