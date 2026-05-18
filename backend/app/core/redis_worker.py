import asyncio
import logging
import redis.asyncio as redis
from redis.exceptions import ResponseError
from core.config import settings
from core.ws_manager import notifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

REDIS_HOST = getattr(settings, "redis_host", "localhost")
REDIS_PORT = getattr(settings, "redis_port", 6379)
REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

STREAM_NAME = "new_jobs_stream"
GROUP_NAME = "fastapi_backend_group"
CONSUMER_NAME = "fastapi_main_worker"

async def setup_redis_group(redis_client):
    """Tạo nhóm tiêu thụ dữ liệu (Consumer Group) để phân chia tải nếu có nhiều bản sao ứng dụng"""
    try:
        await redis_client.xgroup_create(STREAM_NAME, GROUP_NAME, id='$', mkstream=True)
        logger.info(f"[Redis] Đã khởi tạo Consumer Group '{GROUP_NAME}'")
    except ResponseError as e:
        if "BUSYGROUP" in str(e):
            pass # Nhóm đã tồn tại từ trước, không cần tạo lại
        else:
            raise e

async def consume_stream():
    """Hàm chạy vô hạn bất đồng bộ để đón nhận sự kiện job mới"""
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    await setup_redis_group(redis_client)
    
    logger.info("[Redis] Hệ thống lắng nghe sự kiện tuyển dụng bất đồng bộ đã sẵn sàng!")
    
    try:
        while True:
            # Đọc các tin nhắn mới chưa được phân phối cho bất kỳ ai (Ký tự '>')
            messages = await redis_client.xreadgroup(
                groupname=GROUP_NAME,
                consumername=CONSUMER_NAME,
                streams={STREAM_NAME: '>'},
                count=10,
                block=2000 
            )

            if messages:
                for stream, message_list in messages:
                    # Duyệt qua từng tin nhắn nhận được từ Redis
                    for message_id, job_data in message_list:
                        title = job_data.get('title', 'Không có tiêu đề')
                        job_id = job_data.get('job_id')
                    
                        # 1. In ra màn hình Terminal của Backend
                        print(f"✨ [THÔNG BÁO] Đã phát hiện job mới với tiêu đề '{title}'!")

                        # 2. Bắn thông báo qua WebSocket cho Frontend
                        # Cần dùng await vì đây là hàm bất đồng bộ (async)
                        await notifier.broadcast({
                            "type": "NEW_JOB_ALERT",
                            "job_id": job_id, 
                            "title": title
                        })
                    
                        # 3. Báo cho Redis biết là đã xử lý xong tin nhắn này (ACK)
                        await redis_client.xack(STREAM_NAME, GROUP_NAME, message_id)
                        
            # Nghỉ một nhịp nhỏ để giảm tải cho CPU
            await asyncio.sleep(2)
            
    except asyncio.CancelledError:
        logger.info("[Redis] Đang dọn dẹp và ngắt tiến trình chạy ngầm Redis...")
    finally:
        await redis_client.close()