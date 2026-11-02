from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration from environment variables; see `.env.example`."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    # Folder with the MiniLM model files (ADR-0006); downloaded once, not part of the repository.
    embedding_model_dir: str = "D:/models/paraphrase-multilingual-MiniLM-L12-v2"


def load_settings() -> Settings:
    return Settings()  # ty: ignore[missing-argument]
