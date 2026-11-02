from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration from environment variables; see `.env.example`."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    embedding_url: str = "http://localhost:11434"
    embedding_model: str = "bge-m3"


def load_settings() -> Settings:
    return Settings()  # ty: ignore[missing-argument]
