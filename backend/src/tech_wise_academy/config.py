from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration from environment variables; see `.env.example`."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str


def load_settings() -> Settings:
    return Settings()  # ty: ignore[missing-argument]
