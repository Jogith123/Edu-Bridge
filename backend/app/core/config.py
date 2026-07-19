from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./edubridge.db"
    SECRET_KEY: str = "edubridge-ai-super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    GEMINI_API_KEY: str = ""
    VAPI_API_KEY: str = ""
    VAPI_PHONE_NUMBER_ID: str = ""
    VAPI_WEBHOOK_URL: str = ""
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://edubridge-frontend-414139959751.us-central1.run.app"


    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
