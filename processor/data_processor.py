import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
import re
import os
from dotenv import load_dotenv

# Load biến môi trường từ file .env (Nhớ cấu hình DB_NAME, DB_USER, DB_PASS...)
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "mining_cv_db")
DB_USER = os.getenv("DB_USER", "postgres") 
DB_PASS = os.getenv("DB_PASS", "password") 
DB_PORT = os.getenv("DB_PORT", "5432")

def parse_salary(salary_str):
    """
    Hàm 'rửa' dữ liệu lương: Biến chuỗi text thành min_salary và max_salary (VNĐ)
    """
    if not isinstance(salary_str, str):
        return None, None
    
    salary_str = salary_str.lower().strip()
    
    # Nếu là thoả thuận hoặc chưa đăng nhập
    if "thoả thuận" in salary_str or "đăng nhập" in salary_str:
        return None, None

    min_sal, max_sal = None, None
    
    # Bắt trường hợp: 15 - 20 triệu
    match_range = re.search(r'(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*triệu', salary_str)
    if match_range:
        min_sal = int(float(match_range.group(1)) * 1000000)
        max_sal = int(float(match_range.group(2)) * 1000000)
        return min_sal, max_sal
        
    # Bắt trường hợp: Tới 30 triệu / Lên đến 30 triệu
    match_up_to = re.search(r'(tới|lên đến|up to)\s*(\d+(?:\.\d+)?)\s*triệu', salary_str)
    if match_up_to:
        max_sal = int(float(match_up_to.group(2)) * 1000000)
        return None, max_sal
        
    # Bắt trường hợp: Từ 15 triệu
    match_from = re.search(r'(từ|from)\s*(\d+(?:\.\d+)?)\s*triệu', salary_str)
    if match_from:
        min_sal = int(float(match_from.group(2)) * 1000000)
        return min_sal, None

    # (Bạn có thể thêm logic cho USD nếu cần, ở đây tạm focus vào VNĐ)
    return min_sal, max_sal

def parse_tech_stack(tech_str):
    """
    Biến chuỗi "Java, Python, Javascript" thành mảng (List) Python ['Java', 'Python', 'Javascript']
    """
    if not isinstance(tech_str, str) or tech_str == "Không ghi rõ" or tech_str.strip() == "":
        return []
    
    # Cắt theo dấu phẩy, xóa khoảng trắng thừa và viết hoa chữ cái đầu cho đồng bộ
    skills = [skill.strip().title() for skill in tech_str.split(',')]
    # Loại bỏ các skill rỗng hoặc trùng lặp
    return list(set(filter(None, skills)))

def process_and_load_data(csv_file_path, source_name):
    print(f"\n--- BẮT ĐẦU XỬ LÝ DỮ LIỆU TỪ {source_name} ---")
    
    try:
        # 1. ĐỌC DỮ LIỆU BẰNG PANDAS
        df = pd.read_csv(csv_file_path)
        print(f"-> Đã đọc {len(df)} dòng từ {csv_file_path}")
        
        # 2. TRANSFORM (XỬ LÝ DỮ LIỆU)
        # Tạo thêm 2 cột min_salary và max_salary từ hàm parse_salary
        df[['min_salary', 'max_salary']] = df['Mức lương'].apply(lambda x: pd.Series(parse_salary(x)))
        
        # Đổi chuỗi Ngôn ngữ thành List
        df['tech_stack_array'] = df['Ngôn ngữ'].apply(parse_tech_stack)
        
        # 3. LOAD (ĐẨY VÀO DATABASE POSTGRESQL)
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS, port=DB_PORT)
        cursor = conn.cursor()
        
        # Câu lệnh Insert (ON CONFLICT DO NOTHING giúp bỏ qua bài trùng lặp link)
        insert_query = """
            INSERT INTO jobs (
                title, company, raw_salary, min_salary, max_salary, 
                city, experience, job_level, tech_stack, link, source, trust_score
            ) VALUES (
                %s, %s, %s, %s, %s, 
                %s, %s, %s, %s, %s, %s, 100
            ) ON CONFLICT (link) DO NOTHING;
        """
        
        # Chuẩn bị dữ liệu để chèn hàng loạt (Bulk Insert)
        data_to_insert = []
        for index, row in df.iterrows():
            data_to_insert.append((
                row['Tiêu đề'], 
                row['Công ty'], 
                row['Mức lương'], 
                row['min_salary'] if pd.notna(row['min_salary']) else None, 
                row['max_salary'] if pd.notna(row['max_salary']) else None,
                row['Thành phố'], 
                row['Kinh nghiệm'], 
                row['Trình độ'], 
                row['tech_stack_array'], # Truyền list Python, psycopg2 sẽ tự map sang TEXT[] của Postgres
                row['Link'], 
                source_name
            ))
            
        # Thực thi Bulk Insert cho nhanh
        execute_batch(cursor, insert_query, data_to_insert)
        conn.commit()
        
        # Kiểm tra xem có bao nhiêu dòng thực sự được insert (bỏ qua dòng trùng)
        print(f"-> Đã Load dữ liệu vào Database thành công!")
        
    except Exception as e:
        print(f"LỖI: {e}")
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    # Đường dẫn (Tùy thuộc vào việc bạn đặt file ở đâu so với thư mục ingestion)
    # Ví dụ: file data_processor.py nằm trong thư mục processor
    topcv_csv = "../ingestion/test_topcv_jobs_paged.csv" # Đổi lại tên file cho đúng
    itviec_csv = "../ingestion/test_itviec_jobs_paged.csv"  # Đổi lại tên file cho đúng
    
    if os.path.exists(topcv_csv):
        process_and_load_data(topcv_csv, "TopCV")
    else:
        print(f"Không tìm thấy file: {topcv_csv}")
        
    if os.path.exists(itviec_csv):
        process_and_load_data(itviec_csv, "ITviec")
    else:
        print(f"Không tìm thấy file: {itviec_csv}")