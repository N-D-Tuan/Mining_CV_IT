from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "job-service"
    debug: bool = True
    secret_key: str = "secret"
    database_url: str
    redis_url: str
    backend_cors_origins: str = "*"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()