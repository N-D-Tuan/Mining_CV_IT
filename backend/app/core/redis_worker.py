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
                    group_counts = {}
                    
                    for message_id, job_data in message_list:
                        group_name = job_data.get('source', 'Group ẩn danh')
                        
                        # Cộng dồn số lượng bài đăng của group đó
                        if group_name not in group_counts:
                            group_counts[group_name] = 0
                        group_counts[group_name] += 1
                    
                    print("")
                    for group_name, count in group_counts.items():
                        msg_text = f"Đã phát hiện {count} bài đăng tuyển việc làm mới ở group {group_name}!"
                        print(f"✨ [THÔNG BÁO] {msg_text}")

                        # =======================================================
                        # GỬI QUA WEBSOCKET CHO TOÀN BỘ TRÌNH DUYỆT ĐANG ONLINE
                        # =======================================================
                        await notifier.broadcast({
                            "type": "NEW_JOB_ALERT",
                            "group_name": group_name,
                            "count": count,
                            "message": msg_text
                        })
                    
                    for message_id, job_data in message_list:
                        await redis_client.xack(STREAM_NAME, GROUP_NAME, message_id)
                        
            # Nghỉ một nhịp nhỏ để giảm tải cho CPU
            await asyncio.sleep(1)
            
    except asyncio.CancelledError:
        logger.info("[Redis] Đang dọn dẹp và ngắt tiến trình chạy ngầm Redis...")
    finally:
        await redis_client.close()