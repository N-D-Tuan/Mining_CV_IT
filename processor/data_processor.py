import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
import re
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "mining_cv_db")
DB_USER = os.getenv("DB_USER", "postgres") 
DB_PASS = os.getenv("DB_PASS", "password") 
DB_PORT = os.getenv("DB_PORT", "5432")

def parse_salary(salary_str):
    """
    Hàm 'rửa' dữ liệu lương: Tự động nhận diện VND/USD, loại bỏ ký tự thừa và quy đổi ra VND
    """
    if not isinstance(salary_str, str):
        return None, None
    
    salary_str = salary_str.lower().strip()
    
    # Bỏ qua các trường hợp không có số
    if "thoả thuận" in salary_str or "thỏa thuận" in salary_str or "đăng nhập" in salary_str or "thương lượng" in salary_str or "cạnh tranh" in salary_str:
        return None, None

    min_sal, max_sal = None, None
    
    # ==========================================
    # 1. XỬ LÝ USD (Quy đổi 1 USD = 25,000 VND)
    # ==========================================
    if 'usd' in salary_str or '$' in salary_str:
        USD_TO_VND = 25000
        
        # Hàm nội bộ để xóa dấu phẩy/chấm (VD: 2,500 -> 2500, 2.000 -> 2000)
        def clean_usd(val):
            return int(re.sub(r'[,\.]', '', val))
            
        # Range: "600 - 2,500 USD" hoặc "$600 - $2500"
        match_usd_range = re.search(r'([\d,\.]+)\s*(?:usd|\$)?\s*-\s*([\d,\.]+)\s*(?:usd|\$)', salary_str)
        if match_usd_range:
            min_sal = clean_usd(match_usd_range.group(1)) * USD_TO_VND
            max_sal = clean_usd(match_usd_range.group(2)) * USD_TO_VND
            return min_sal, max_sal
            
        # Up to: "Up to 2.000 USD" hoặc "Lên đến 2000$"
        match_usd_upto = re.search(r'(?:tới|lên đến|up to)\s*([\d,\.]+)\s*(?:usd|\$)', salary_str)
        if match_usd_upto:
            max_sal = clean_usd(match_usd_upto.group(1)) * USD_TO_VND
            return None, max_sal
            
        # From: "Từ 500 USD"
        match_usd_from = re.search(r'(?:từ|from)\s*([\d,\.]+)\s*(?:usd|\$)', salary_str)
        if match_usd_from:
            min_sal = clean_usd(match_usd_from.group(1)) * USD_TO_VND
            return min_sal, None

    # ==========================================
    # 2. XỬ LÝ VND (Bao gồm "triệu" và "tr")
    # ==========================================
    else:
        # Range: "15 - 22tr", "15tr - 20tr", "15 - 20 triệu"
        match_range = re.search(r'(\d+(?:\.\d+)?)\s*(?:triệu|tr\b)?\s*-\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr\b)', salary_str)
        if match_range:
            min_sal = int(float(match_range.group(1)) * 1000000)
            max_sal = int(float(match_range.group(2)) * 1000000)
            return min_sal, max_sal
            
        # Up to: "Lên đến 30tr", "Up to 30 triệu"
        match_up_to = re.search(r'(?:tới|lên đến|up to)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr\b)', salary_str)
        if match_up_to:
            max_sal = int(float(match_up_to.group(1)) * 1000000)
            return None, max_sal
            
        # From: "Từ 15tr"
        match_from = re.search(r'(?:từ|from)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr\b)', salary_str)
        if match_from:
            min_sal = int(float(match_from.group(1)) * 1000000)
            return min_sal, None

    return min_sal, max_sal

def parse_tech_stack(tech_str):
    """
    Biến chuỗi "Java, Python, Javascript" thành mảng (List) Python ['Java', 'Python', 'Javascript']
    """
    if not isinstance(tech_str, str) or tech_str == "Không ghi rõ" or tech_str.strip() == "":
        return []
    
    skills = [skill.strip().title() for skill in tech_str.split(',')]
    return list(set(filter(None, skills)))

def process_and_load_data(csv_file_path, source_name):
    print(f"\n--- BẮT ĐẦU XỬ LÝ DỮ LIỆU TỪ {source_name.upper()} ---")
    
    try:
        df = pd.read_csv(csv_file_path)
        print(f"-> Đã đọc {len(df)} dòng từ {csv_file_path}")

        # CLEANING: Chuẩn hóa dữ liệu thô trước khi transform
        for col in df.columns:
            if df[col].dtype == object: # Nếu là cột chứa chuỗi (text)
                # 1. Thay thế \n, \r, \t bằng dấu khoảng trắng
                df[col] = df[col].astype(str).str.replace(r'[\n\r\t]+', ' ', regex=True)
                # 2. Xóa các khoảng trắng kép (ví dụ: "Java    Dev" -> "Java Dev")
                df[col] = df[col].str.replace(r'\s{2,}', ' ', regex=True)
                # 3. Cắt tỉa 2 đầu
                df[col] = df[col].str.strip()
                # 4. Trả các chữ 'nan' sinh ra do pandas về dạng None của Python
                df[col] = df[col].replace('nan', None)
        
        # TRANSFORM
        df[['min_salary', 'max_salary']] = df['Mức lương'].apply(lambda x: pd.Series(parse_salary(x)))
        df['tech_stack_array'] = df['Ngôn ngữ'].apply(parse_tech_stack)
        
        # LOAD
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS, port=DB_PORT)
        cursor = conn.cursor()
        
        # TÍNH NĂNG CHỐNG TRÙNG LẶP (DEDUPLICATION):
        # 1. 'ON CONFLICT (link)' -> Ngăn thêm trùng bài cùng 1 nền tảng.
        # 2. 'WHERE NOT EXISTS' -> Ngăn bài đã tồn tại ở nền tảng khác (Dựa vào Tiêu đề + Công ty).
        insert_query = """
            INSERT INTO jobs (
                title, company, raw_salary, min_salary, max_salary, 
                city, experience, job_level, tech_stack, link, source, trust_score
            ) 
            SELECT %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 100
            WHERE NOT EXISTS (
                SELECT 1 FROM jobs 
                WHERE LOWER(title) = LOWER(%s) 
                AND LOWER(company) = LOWER(%s)
            )
            ON CONFLICT (link) DO NOTHING;
        """
        
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
                row['tech_stack_array'], 
                row['Link'], 
                source_name,
                
                # Hai tham số này cung cấp cho khối WHERE NOT EXISTS (Tiêu đề và Công ty)
                row['Tiêu đề'], 
                row['Công ty']
            ))
            
        # Thực thi Bulk Insert
        execute_batch(cursor, insert_query, data_to_insert)
        conn.commit()
        
        print(f"-> Đã Nạp (Load) dữ liệu vào Database thành công!")
        
    except FileNotFoundError:
        print(f"[!] Lỗi: Không tìm thấy file {csv_file_path}")
    except psycopg2.Error as db_err:
        print(f"[!] Lỗi Database: {db_err}")
    except Exception as e:
        print(f"[!] LỖI KHÔNG XÁC ĐỊNH: {e}")
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    target_files = [
        ("../ingestion/test_topcv_jobs_paged.csv", "TopCV"),
        ("../ingestion/test_vnworks_jobs_paged.csv", "VietnamWorks"),
        ("../ingestion/test_topdev_jobs_paged.csv", "TopDev"),
        ("../ingestion/test_careerlink_jobs_paged.csv", "CareerLink")
    ]
    
    print("=====================================================")
    print(" KHỞI ĐỘNG DATA PROCESSOR: CHUẨN HÓA VÀ NẠP DATABASE ")
    print("=====================================================")
    
    for file_path, source in target_files:
        if os.path.exists(file_path):
            process_and_load_data(file_path, source)
        else:
            print(f"\n[!] Bỏ qua {source}: Không tìm thấy file tại '{file_path}'")
            
    print("\n=> HOÀN TẤT TOÀN BỘ QUÁ TRÌNH NẠP DỮ LIỆU!")