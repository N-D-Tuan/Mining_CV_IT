import os
import re
import time  # THÊM MỚI: Dùng để khống chế tốc độ gọi API tránh bị block
import requests  # THÊM MỚI: Thư viện call API Geocoding
import pandas as pd
import psycopg2
import redis
from dotenv import load_dotenv

# ==========================================
# 1. CẤU HÌNH HỆ THỐNG
# ==========================================
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '..', 'ingestion', '.env')
load_dotenv(dotenv_path=env_path)

CSV_FILE_PATH = "../ingestion/fb_parttime_jobs_raw.csv"

# Database configuration
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT"))

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

def get_redis_connection():
    # Kết nối đến container 'job-redis' của bạn
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

# ==========================================
# 2. CÁC HÀM LÀM SẠCH DỮ LIỆU (DATA CLEANING)
# ==========================================
def clean_text(val):
    if pd.isna(val) or not str(val).strip():
        return None
    return re.sub(r'\s+', ' ', str(val).strip())

def clean_raw_salary(val):
    if pd.isna(val) or not str(val).strip():
        return None
    text = str(val).strip()
    # Nếu có dấu hai chấm, cắt chuỗi và lấy toàn bộ phần phía sau
    if ':' in text:
        text = text.split(':', 1)[-1]
    
    # Tiếp tục làm sạch khoảng trắng thừa
    return re.sub(r'\s+', ' ', text.strip())

def clean_employer_name(val):
    if pd.isna(val) or not str(val).strip() or str(val).lower() in ['n/a', 'null', 'none']:
        return 'Cá nhân / Chưa xác định'
    return str(val).strip()

def clean_requirements(val):
    if pd.isna(val) or not str(val).strip():
        return None
    req_list = [req.strip() for req in str(val).split(',') if req.strip()]
    return req_list if req_list else None

def clean_salary_numbers(row):
    min_sal = row.get('min_salary')
    max_sal = row.get('max_salary')
    
    def safe_parse(val):
        if pd.isna(val) or val is None or str(val).strip() == '':
            return None
        try:
            clean_str = re.sub(r'[^\d.]', '', str(val))
            if not clean_str: 
                return None
            num = int(float(clean_str))
            if num > 1000000000 or num < 0:
                return None
            return num
        except:
            return None

    min_sal = safe_parse(min_sal)
    max_sal = safe_parse(max_sal)

    if min_sal is not None and max_sal is not None and min_sal > max_sal:
        min_sal, max_sal = max_sal, min_sal

    # Fix: Trả về một Series có TÊN CỘT RÕ RÀNG để Pandas không bị nhầm lẫn
    return pd.Series({'min_salary': min_sal, 'max_salary': max_sal})

# =========================================================
# THÊM MỚI: HÀM CALL API LẤY TỌA ĐỘ ĐỊA LÝ (GEOCODING)
# =========================================================
def get_coordinates(address, city):
    """
    Sử dụng OpenStreetMap Nominatim API để lấy lat, lng.
    Yêu cầu đảm bảo rate limit tối đa 1 request / giây.
    """
    if not address or str(address).strip() == '':
        return None, None
        
    search_city = city if city else "Đà Nẵng"
    full_address = f"{address}, {search_city}, Việt Nam"
    
    # Định danh User-Agent để tránh bị OpenStreetMap block (HTTP 403)
    headers = {
        'User-Agent': 'FB_Job_Geocoding_Bot/1.0 (contact: admin@timviecparttime.com)'
    }
    
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': full_address,
        'format': 'json',
        'limit': 1
    }
    
    try:
        time.sleep(1.1) # Nghỉ 1 giây để bảo vệ Rate Limit
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data:
                return float(data[0]['lat']), float(data[0]['lon'])
            else:
                # Fallback: Nếu không tìm thấy địa chỉ chi tiết, quét thô theo Tỉnh/Thành phố
                params['q'] = f"{search_city}, Việt Nam"
                response = requests.get(url, params=params, headers=headers, timeout=5)
                if response.status_code == 200 and response.json():
                    return float(response.json()[0]['lat']), float(response.json()[0]['lon'])
        return None, None
    except Exception as e:
        print(f"    [!] Lỗi khi gọi Geocoding API: {e}")
        return None, None

# ==========================================
# 3. CORE CHÍNH: XỬ LÝ VÀ LƯU DATABASE
# ==========================================
def process_and_save_data():
    if not os.path.exists(CSV_FILE_PATH):
        print(f"[!] Không tìm thấy file {CSV_FILE_PATH}. Vui lòng chạy Crawler trước.")
        return

    print("[*] Đang đọc dữ liệu từ CSV...")
    df = pd.read_csv(CSV_FILE_PATH)
    
    if df.empty:
        print("[!] File CSV trống. Không có dữ liệu để xử lý.")
        return

    print(f"[*] Tổng số bài viết cào được: {len(df)}")

    # ---------------------------------------------------------
    # BƯỚC 1: LÀM SẠCH DỮ LIỆU
    # ---------------------------------------------------------
    print("[*] Đang tiến hành làm sạch dữ liệu (Data Cleaning)...")
    
    expected_columns = [
        'title', 'employer_name', 'raw_salary', 'min_salary', 'max_salary', 
        'salary_type', 'city', 'address', 'job_type', 'experience_required', 
        'requirements', 'post_content', 'link', 'source'
    ]
    for col in expected_columns:
        if col not in df.columns:
            df[col] = None
    
    df = df.dropna(subset=['title', 'post_content', 'link'])
    if df.empty:
        print("[!] Không có dữ liệu hợp lệ (thiếu tiêu đề/nội dung/link). Dừng xử lý.")
        return
        
    df = df.drop_duplicates(subset=['link'], keep='first')
    
    df['title'] = df['title'].apply(clean_text)
    df['employer_name'] = df['employer_name'].apply(clean_employer_name)
    df['salary_type'] = df['salary_type'].apply(clean_text)
    df['city'] = df['city'].apply(clean_text)
    df['address'] = df['address'].apply(clean_text)
    df['job_type'] = df['job_type'].apply(clean_text)
    df['raw_salary'] = df['raw_salary'].apply(clean_raw_salary)
    df['experience_required'] = df['experience_required'].apply(clean_text)
    df['source'] = df['source'].apply(clean_text)
    
    df['requirements'] = df['requirements'].apply(clean_requirements)
    
    # Gán lại giá trị lương an toàn
    salary_df = df.apply(clean_salary_numbers, axis=1)
    df['min_salary'] = salary_df['min_salary']
    df['max_salary'] = salary_df['max_salary']

    # 🛡️ BÍ QUYẾT FIX LỖI BIGINT (Ép Pandas cho phép lưu giá trị None)
    df = df.astype(object)
    df = df.where(pd.notnull(df), None)

    # ---------------------------------------------------------
    # BƯỚC 2: KẾT NỐI DB, REDIS VÀ LƯU DỮ LIỆU
    # ---------------------------------------------------------

    conn = get_db_connection()
    redis_client = get_redis_connection() # Khởi tạo kết nối Redis
    inserted_count = 0
    skipped_count = 0

    CACHE_KEY = "processed_job_links"

    try:
        with conn.cursor() as cursor:
            for index, row in df.iterrows():
                link = row['link']

                # ==========================================
                # 1. KIỂM TRA TRONG REDIS CACHE TRƯỚC (Siêu nhanh)
                # ==========================================
                if redis_client.sismember(CACHE_KEY, link):
                    print(f"    [-] Bỏ qua (Đã có trong Cache): {row['title']} - {link}")
                    skipped_count += 1
                    continue
                
                # ==========================================
                # 2. NẾU CHƯA CÓ TRONG CACHE -> KIỂM TRA TRONG DB (Chậm hơn)
                # ==========================================
                cursor.execute("SELECT id FROM jobs WHERE link = %s", (link,))
                if cursor.fetchone():
                    print(f"    [-] Bỏ qua (Đã tồn tại trong DB): {row['title']} - {link}")
                    skipped_count += 1
                    redis_client.sadd(CACHE_KEY, link)
                    continue

                # ==========================================
                # 3. NẾU MỚI HOÀN TOÀN -> LƯU VÀO DB
                # ==========================================

                final_min_sal = int(row['min_salary']) if row['min_salary'] is not None else None
                final_max_sal = int(row['max_salary']) if row['max_salary'] is not None else None

                # THÊM MỚI: Tiến hành dịch địa chỉ thành tọa độ
                lat, lng = get_coordinates(row['address'], row['city'])

                # THÊM MỚI: Bổ sung 2 trường lat, lng vào câu lệnh SQL INSERT
                cursor.execute("""
                    INSERT INTO jobs (
                        title, employer_name, raw_salary, min_salary, max_salary, 
                        salary_type, city, address, job_type, experience_required, 
                        requirements, post_content, link, source, lat, lng
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING id
                """, (
                    row['title'], row['employer_name'], row['raw_salary'],
                    final_min_sal, final_max_sal, row['salary_type'],
                    row['city'], row['address'], row['job_type'],
                    row['experience_required'], row['requirements'],
                    row['post_content'], link, row['source'], lat, lng
                ))
                
                # Lấy ID của công việc vừa được lưu vào Postgres
                new_job_id = cursor.fetchone()[0]
                inserted_count += 1

                # Cập nhật link mới vào Redis Cache
                redis_client.sadd(CACHE_KEY, link)

                # ==========================================
                # THÊM MỚI: BẮN EVENT LÊN REDIS STREAM
                # ==========================================
                try:
                    # THÊM MỚI: Đính kèm luôn chuỗi tọa độ lat, lng vào thông điệp Stream 
                    # giúp các Service theo dõi (Consumer) lấy được ngay mà không cần query lại DB
                    event_data = {
                        'job_id': str(new_job_id),
                        'title': str(row['title']) if pd.notna(row['title']) else 'Không có tiêu đề',
                        'employer': str(row['employer_name']) if pd.notna(row['employer_name']) else 'Ẩn danh',
                        'source': str(row['source']) if pd.notna(row['source']) else 'Unknown',
                        'lat': str(lat) if lat is not None else 'None',
                        'lng': str(lng) if lng is not None else 'None'
                    }
                    
                    # 'new_jobs_stream' là tên của dòng chảy sự kiện.
                    redis_client.xadd('new_jobs_stream', event_data, '*')
                    print(f"    [>] Đã bắn tin lên Redis Stream kèm tọa độ: {row['title']}")
                except Exception as redis_err:
                    print(f"    [!] Lỗi khi bắn tin Redis (Job vẫn được lưu DB): {redis_err}")
                # ==========================================

            conn.commit()
            
            print(f"\n{'='*40}")
            print(" BÁO CÁO NHẬP DỮ LIỆU (DATABASE & REDIS)")
            print(f"{'='*40}")
            print(f"[✓] Đã lưu mới và báo cáo Redis: {inserted_count} công việc.")
            if skipped_count > 0:
                print(f"[-] Đã bỏ qua: {skipped_count} công việc (Đã tồn tại link trong DB).")
                
    except Exception as e:
        conn.rollback()
        print(f"Lỗi cơ sở dữ liệu: {e}")
    finally:
        conn.close()
        redis_client.close() # Nhớ đóng kết nối Redis      

if __name__ == "__main__":
    process_and_save_data()

# Cập nhật db
# ALTER TABLE public.jobs 
# ADD COLUMN IF NOT EXISTS lat NUMERIC(10, 8),
# ADD COLUMN IF NOT EXISTS lng NUMERIC(11, 8);