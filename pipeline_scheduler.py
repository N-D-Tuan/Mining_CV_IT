import time
import subprocess
import sys
import os
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
    print("\n--- PHASE 1: Đang cào dữ liệu việc làm từ Facebook ---")
    ingestion_dir = os.path.join(ROOT_DIR, "ingestion")
    
    run_script("fb_crawler.py", cwd=ingestion_dir)

    # BƯỚC 2: Xử lý và Tải lên Database (Processor)
    print("\n--- PHASE 2: Đang xử lý và lưu vào PostgreSQL ---")
    run_script("data_processor.py", cwd=os.path.join(ROOT_DIR, "processor"))

    finish_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n [{finish_time}] HOÀN THÀNH CHU KỲ. Hẹn gặp lại sau 3 phút...")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    print("=== HỆ THỐNG TỰ ĐỘNG CẬP NHẬT VIỆC LÀM ĐÃ KHỞI ĐỘNG ===")
    print("-> Tần suất: 3 phút / lần")
    print("-> Nhấn Ctrl + C để dừng hệ thống.\n")

    # Chạy ngay lập tức lần đầu tiên
    job_pipeline()

    # Vòng lặp vô hạn, cứ ngủ 3 phút (180 giây) rồi dậy làm việc
    CYCLE_MINUTES = 3

    while True:
        # Đếm ngược cho sinh động (Tùy chọn)
        for remaining in range(CYCLE_MINUTES * 60, 0, -1):
            sys.stdout.write(f"\rChờ chu kỳ tiếp theo trong: {remaining} giây... ")
            sys.stdout.flush()
            time.sleep(1)
            
        sys.stdout.write("\r" + " "*50 + "\r") # Xóa dòng đếm ngược
        job_pipeline()