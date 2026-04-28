import time
import subprocess
import sys
import os
import concurrent.futures
from datetime import datetime

# Đảm bảo script chạy đúng từ thư mục gốc
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def run_script(script_path, cwd):
    """Hàm chạy một file Python riêng biệt và in log ra màn hình"""
    try:
        # Lệnh subprocess gọi 'python tên_file.py' giống hệt cách bạn gõ trên terminal
        process = subprocess.run(
            [sys.executable, script_path], 
            cwd=cwd, 
            check=True,
            text=True
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n[LỖI] Script {script_path} chạy thất bại với mã lỗi: {e.returncode}")
        return False

def job_pipeline():
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n{'='*60}")
    print(f" [{current_time}] BẮT ĐẦU CHU KỲ DATA PIPELINE")
    print(f"{'='*60}")

    # BƯỚC 1: Thu thập dữ liệu (Ingestion)
    print("\n--- PHASE 1: Đang cào dữ liệu ĐỒNG THỜI từ 4 nền tảng ---")
    ingestion_dir = os.path.join(ROOT_DIR, "ingestion")
    
    # Danh sách 4 công nhân cào dữ liệu
    crawlers = [
        "topcv_crawler.py", 
        "vnworks_crawler.py", 
        "topdev_crawler.py", 
        "careerlink_crawler.py"
    ]

    # Mở 4 luồng (threads) để chạy 4 script cùng 1 thời điểm
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = []
        for crawler in crawlers:
            # Giao việc cho luồng hiện tại
            futures.append(executor.submit(run_script, crawler, ingestion_dir))
            
            # [QUAN TRỌNG] Nghỉ 3 giây trước khi gọi luồng tiếp theo.
            # Tránh xung đột WinError 32 khi 4 file cùng giành giật chromedriver.exe
            time.sleep(3) 
            
        # Đứng chờ cả 4 file chạy xong hoàn toàn
        concurrent.futures.wait(futures)

    # BƯỚC 2: Xử lý và Tải lên Database (Processor)
    print("\n--- PHASE 2: Đang xử lý và lưu vào PostgreSQL ---")
    run_script("data_processor.py", cwd=os.path.join(ROOT_DIR, "processor"))

    finish_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n [{finish_time}] HOÀN THÀNH CHU KỲ. Hẹn gặp lại sau 5 phút...")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    print("=== HỆ THỐNG TỰ ĐỘNG CẬP NHẬT VIỆC LÀM ĐÃ KHỞI ĐỘNG ===")
    print("-> Tần suất: 5 phút / lần")
    print("-> Nhấn Ctrl + C để dừng hệ thống.\n")

    # Chạy ngay lập tức lần đầu tiên
    job_pipeline()

    # Vòng lặp vô hạn, cứ ngủ 5 phút (300 giây) rồi dậy làm việc
    CYCLE_MINUTES = 5
    
    while True:
        # Đếm ngược cho sinh động (Tùy chọn)
        for remaining in range(CYCLE_MINUTES * 60, 0, -1):
            sys.stdout.write(f"\rChờ chu kỳ tiếp theo trong: {remaining} giây... ")
            sys.stdout.flush()
            time.sleep(1)
            
        sys.stdout.write("\r" + " "*50 + "\r") # Xóa dòng đếm ngược
        job_pipeline()