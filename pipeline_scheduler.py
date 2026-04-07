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
    print("\n--- PHASE 1.1: Đang cào dữ liệu từ TopCV ---")
    run_script("topcv_crawler.py", cwd=os.path.join(ROOT_DIR, "ingestion"))

    print("\n--- PHASE 1.2: Đang cào dữ liệu từ ITviec ---")
    run_script("itviec_crawler.py", cwd=os.path.join(ROOT_DIR, "ingestion"))

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