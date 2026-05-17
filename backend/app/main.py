from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager 
import asyncio 

from api.router import api_router
from core.config import settings
from models.init import *
from core.redis_worker import consume_stream

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo và kích hoạt tiến trình lắng nghe Redis Stream chạy ngầm
    redis_task = asyncio.create_task(consume_stream())
    
    yield # Tại vị trí này, ứng dụng FastAPI bắt đầu nhận request từ Client bình thường
    
    # Khi ứng dụng FastAPI bị tắt (Ctrl + C), tiến trình nền sẽ được thu hồi an toàn
    redis_task.cancel()
    await asyncio.gather(redis_task, return_exceptions=True)

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.backend_cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
