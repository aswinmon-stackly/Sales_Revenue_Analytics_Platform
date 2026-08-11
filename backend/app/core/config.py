"""
Centralized application configuration.

All environment-dependent values (DB connection, JWT secret, CORS, etc.)
are read here via pydantic-settings so the rest of the app never touches
os.environ directly and nothing is hardcoded.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60

    # CORS - comma separated string of origins
    CORS_ORIGINS: str = "http://localhost:5173"

    # Dashboard
    # NOTE: There is no "targets" table yet. This is a placeholder, admin-
    # configurable monthly revenue target used to compute the Dashboard's
    # "Monthly Target" gauge until a proper targets feature (per-month,
    # per-team targets stored in the DB) is built. See README for details.
    MONTHLY_REVENUE_TARGET: float = 650000

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached so Settings() is only parsed once per process."""
    return Settings()


settings = get_settings()
