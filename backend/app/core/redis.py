# core/redis.py
import redis.asyncio as aioredis
from core.config import settings

redis_client = aioredis.from_url(settings.redis_url, decode_responses=True)