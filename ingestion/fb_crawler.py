import time
import random
import json
import re
import os
import hashlib
import pandas as pd
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from google import genai
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, date

# ==========================================
# 1. CẤU HÌNH HỆ THỐNG VÀ BẢO MẬT (.ENV)
# ==========================================
load_dotenv()

FB_EMAIL = os.getenv("FB_EMAIL")
FB_PASSWORD = os.getenv("FB_PASSWORD")
CSV_FILE_PATH = "fb_parttime_jobs_raw.csv"

# Database configuration
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

API_KEYS = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
    os.getenv("GEMINI_API_KEY_6")
]
API_KEYS = [key for key in API_KEYS if key] 

if not API_KEYS:
    print("[!] Lỗi: Không tìm thấy GEMINI_API_KEY nào trong file .env!")
    exit()

current_key_index = 0
ai_client = None

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

def get_active_fb_groups():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT id, name, url, crawl_count_today, max_posts_per_crawl
                FROM fb_groups 
                WHERE status = 'active'
                ORDER BY last_crawl ASC NULLS FIRST
            """)
            groups = cursor.fetchall()
            return groups
    finally:
        conn.close()

def update_group_crawl_info(group_id, crawl_count_today):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE fb_groups 
                SET crawl_count_today = %s, last_crawl = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (crawl_count_today, group_id))
            conn.commit()
    finally:
        conn.close()

def reset_daily_crawl_counts():
    today = date.today()
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) FROM fb_groups 
                WHERE DATE(last_crawl) < %s AND crawl_count_today > 0
            """, (today,))
            if cursor.fetchone()[0] > 0:
                cursor.execute("""
                    UPDATE fb_groups 
                    SET crawl_count_today = 0 
                    WHERE DATE(last_crawl) < %s
                """, (today,))
                conn.commit()
                print("[*] Đã reset số lần crawl hàng ngày")
    finally:
        conn.close()

def init_ai_client():
    global ai_client
    try:
        ai_client = genai.Client(api_key=API_KEYS[current_key_index])
        print(f"[*] Đã nạp AI Client thành công với Key số {current_key_index + 1}")
    except Exception as e:
        print(f"[!] Lỗi khởi tạo AI Client: {e}")
        exit()

def switch_api_key():
    global current_key_index, ai_client
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    print(f"    [↻] Đang xoay vòng sang API Key số {current_key_index + 1}...")
    ai_client = genai.Client(api_key=API_KEYS[current_key_index])

init_ai_client()

# ==========================================
# 2. HÀM AI PARSER VÀ HEURISTIC PRE-FILTER
# ==========================================

def is_potential_job_post(text):
    """
    Bộ lọc sơ bộ (Heuristic) để xác định bài viết có khả năng là bài tuyển dụng hay không.
    Giúp giảm tải gọi API AI cho các bài đăng rác (bán hàng, tìm việc, tìm trọ).
    """
    text_lower = text.lower()

    # 1. Lọc các bài đăng của ứng viên tự tìm việc
    applicant_keywords = [
        "em cần tìm", "mình cần tìm", "em tìm việc", "mình tìm việc", "cần tìm việc",
        "tìm việc part", "có việc gì", "ai có việc", "có job nào",
        "em muốn tìm", "mình muốn tìm"
    ]
    if any(kw in text_lower for kw in applicant_keywords):
        # Đề phòng ngoại lệ: nhà tuyển dụng dùng từ khóa (VD: "Tuyển dụng ứng viên cần tìm việc...")
        if "tuyển" not in text_lower and "ứng viên" not in text_lower:
            return False

    # 2. Lọc bài spam: Bán hàng, thanh lý, tìm trọ, bóc phốt,...
    spam_keywords = [
        "thanh lý", "xả kho", "xả hàng", "pass đồ", "pass lại", "pass gấp",
        "thu mua", "cầm đồ", "cho vay", "vay tín chấp",
        "tìm trọ", "cho thuê phòng", "pass phòng", "nhượng phòng", "phòng trọ",
        "bóc phốt", "cảnh báo lừa đảo", "lừa đảo"
    ]
    if any(kw in text_lower for kw in spam_keywords):
        # Ngoại lệ: Bài tuyển dụng ghi "Cam kết không lừa đảo"
        if not ("không lừa đảo" in text_lower or "cam kết" in text_lower):
            return False

    # 3. Phải chứa ít nhất 1 từ khóa phổ biến của việc làm
    job_keywords = ["tuyển", "cần người", "tìm người", "job", "lương", "ca làm", "parttime", "fulltime", "thu nhập", "nhân viên", "việc làm", "phụ", "giúp"]
    if not any(kw in text_lower for kw in job_keywords):
        return False

    return True

def parse_post_with_ai(raw_text, post_link, name_group, image_text=None):
    # Rate Limiting: Delay nhỏ để tránh lỗi 429 Limit từ Gemini AI (Tối đa ~60 requests/phút)
    time.sleep(1.5)
    
    prompt = f"""
    Bạn là một trợ lý ảo thông minh chuyên phân tích dữ liệu tuyển dụng việc làm.
    Nhiệm vụ 1: Đọc nội dung chữ và GIÁ TRỊ TỪ THẺ IMG (nếu có). Nếu dữ liệu từ thẻ img tương tự hoặc trùng lặp với nội dung chữ, hãy bỏ qua phần trùng.
    Mục tiêu: giữ lại chỉ nội dung liên quan đến tuyển dụng.
    Mục tiêu 2: Nếu đây KHÔNG PHẢI là bài tuyển dụng việc làm hợp lệ (VD: bài bán hàng, phốt, hỏi đáp, tìm trọ), hãy trả về JSON: {{"is_valid_job_post": false}}
    Mục tiêu 3: Nếu ĐÚNG là bài tuyển dụng, hãy trích xuất thành ĐÚNG MỘT OBJECT JSON và kết hợp thông tin từ chữ + nội dung img thành trường "post_content" mà không lặp lại nội dung.
    
    {{
        "is_valid_job_post": true,
        "title": "(string) Tiêu đề công việc",
        "employer_name": "(string) Tên quán, công ty",
        "raw_salary": "(string) Giữ nguyên câu chữ nói về lương",
        "min_salary": (integer) Lương thấp nhất quy ra VNĐ (không có để null),
        "max_salary": (integer) Lương cao nhất quy ra VNĐ,
        "salary_type": "(string) Chọn 1: 'hourly', 'daily', 'monthly'",
        "city": "(string) Thành phố",
        "address": "(string) Địa chỉ cụ thể",
        "job_type": "(string) Loại hình",
        "experience_required": "(string) Yêu cầu kinh nghiệm",
        "requirements": ["Yêu cầu 1", "Yêu cầu 2"],
        "post_content": "(string) Nội dung đầy đủ của bài đăng, kết hợp từ text và img, bỏ phần trùng lặp, chỉ giữ thông tin tuyển dụng"
    }}
    
    Tuyệt đối không giải thích thêm.
    
    Bài đăng (Phần chữ):
    '''
    {raw_text}
    '''
    """

    if image_text:
        prompt += f"""

    Dữ liệu từ thẻ img:
    '''
    {image_text}
    '''
    """

    prompt += """

    Nếu dữ liệu trong ảnh trùng lặp với nội dung chữ, chỉ giữ một lần. Nếu chỉ dữ liệu trong ảnh mới có thông tin tuyển dụng quan trọng, hãy thêm vào post_content.
    """

    for attempt in range(6):
        try:
            response = ai_client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            json_str = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_str:
                job_data = json.loads(json_str.group())
                if job_data.get("is_valid_job_post") is False:
                    return "INVALID"
                if job_data.get('requirements') and isinstance(job_data['requirements'], list):
                    job_data['requirements'] = ", ".join(job_data['requirements'])
                else:
                    job_data['requirements'] = None
                if 'post_content' not in job_data:
                    job_data['post_content'] = raw_text
                job_data['link'] = post_link
                job_data['source'] = name_group
                return job_data
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                print(f"    [!] Key số {current_key_index + 1} hết hạn mức. Xoay vòng Key...")
                switch_api_key()
                time.sleep(2)
            elif "503" in err_msg or "UNAVAILABLE" in err_msg:
                print(f"    [!] Server Google đang bận (Lỗi 503). Chờ 5s thử lại...")
                time.sleep(5)
            else:
                print(f"    [!] Lỗi AI không xác định: {err_msg}")
                break
    return None

# ==========================================
# 3. CORE CHÍNH: SELENIUM & SCRAPING
# ==========================================
def init_driver():
    options = webdriver.ChromeOptions()
    prefs = {"profile.default_content_setting_values.notifications": 2}
    options.add_experimental_option("prefs", prefs)
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument("--disable-blink-features=AutomationControlled")
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

def perform_login(driver):
    email_field = WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.NAME, "email")))
    email_field.clear() 
    email_field.send_keys(FB_EMAIL)
    time.sleep(random.uniform(1, 2))
    
    pass_field = driver.find_element(By.NAME, "pass")
    pass_field.clear()
    pass_field.send_keys(FB_PASSWORD)
    time.sleep(random.uniform(1, 2))
    
    try:
        login_btn = driver.find_element(By.XPATH, "//div[@role='button' and contains(@aria-label, 'Đăng nhập')]")
        login_btn.click()
    except:
        pass_field.send_keys(Keys.ENTER)

def setup_facebook_session():
    driver = init_driver()
    login_success = False
    
    for attempt in range(1, 5): 
        print(f"\n[*] Mở Facebook (Lượt kiểm tra: {attempt}/4)...")
        driver.get("https://www.facebook.com/")
        time.sleep(random.uniform(3, 5))
        
        check_email_exist = driver.find_elements(By.NAME, "email")
        if len(check_email_exist) == 0:
            print("[*] NHẬN DIỆN PROFILE THẬT: Tài khoản đã được đăng nhập sẵn! Bỏ qua toàn bộ bước nhập liệu.")
            login_success = True
            break
        else:
            print("[*] Profile hiện tại chưa đăng nhập, tiến hành nhập thông tin dự phòng...")
            try:
                perform_login(driver)
            except Exception as e:
                print(f"[!] Lỗi form đăng nhập: {e}")
                driver.quit()
                return None
            
        time.sleep(random.uniform(8, 12))
        current_url = driver.current_url
        
        if "challenge" in current_url or "two_step_verification" in current_url or "checkpoint" in current_url:
            print(f"[!] BỊ YÊU CẦU XÁC THỰC! URL hiện tại: {current_url}")
            if attempt == 1:
                time.sleep(10)
                continue 
            else:
                time.sleep(10) 
                driver.quit()
                return None
        else:
            email_inputs = driver.find_elements(By.NAME, "email")
            if len(email_inputs) > 0:
                print("[!] CẢNH BÁO: Vẫn kẹt ở màn hình ngoài. Chờ vòng lặp sau...")
                if attempt < 2:
                    time.sleep(3)
                    continue
                else:
                    print("[!] Đăng nhập thất bại. Dừng bot.")
                    driver.quit()
                    return None
            else:
                print("[*] Đăng nhập thành công, form login đã biến mất!")
                login_success = True
                break 
    
    if login_success:
        return driver
    else:
        driver.quit()
        return None

def scrape_single_group(driver, group_url, name_group, max_posts_to_scrape, processed_hashes, processed_links):
    scraped_jobs = [] 
    
    print(f"\n[*] Chuyển hướng vào Group: {group_url}")
    driver.get(group_url)
    time.sleep(random.uniform(6, 10)) 
    
    print("\n[*] ================= BẮT ĐẦU QUÉT TỪNG BÀI =================")
    
    scroll_attempts = 0
    
    while len(scraped_jobs) < max_posts_to_scrape and scroll_attempts < 10:
        content_boxes = driver.find_elements(By.XPATH, "//div[@data-ad-rendering-role='story_message' or @data-ad-comet-preview='message']") 
        found_new_post_on_screen = False
        
        for index in range(len(content_boxes)):
            try:
                current_boxes = driver.find_elements(By.XPATH, "//div[@data-ad-rendering-role='story_message' or @data-ad-comet-preview='message']")
                if index >= len(current_boxes): break
                box = current_boxes[index]

                raw_text = box.text.strip()
                post_link = "N/A"
                image_text = None
                all_links = []

                # Xử lý trích xuất Link và Image Text sớm hơn
                try:
                    wrapper = box.find_element(By.XPATH, "./ancestor::div[position() <= 15]")
                    
                    # 1. TÌM LINK
                    all_links = wrapper.find_elements(By.TAG_NAME, "a")
                    for a in all_links:
                        href = a.get_attribute("href")
                        if href and ("/groups/" in href):
                            if "/permalink/" in href or "/posts/" in href or "/multi_permalinks/" in href or "/share/" in href:
                                post_link = href.split('?')[0]
                                break
                    
                    # 2. LẤY NỘI DUNG TỪ THẺ IMG SỚM NHẤT CÓ THỂ
                    imgs = wrapper.find_elements(By.TAG_NAME, "img")
                    candidate_texts = []
                    for img in imgs:
                        src = img.get_attribute("src")
                        if not src or "emoji" in src or "images/ext" in src:
                            continue
                        alt = (img.get_attribute("alt") or "").strip()
                        aria = (img.get_attribute("aria-label") or "").strip()
                        text_candidate = "".join([part for part in [alt, aria] if part])
                        if not text_candidate:
                            continue
                        if len(text_candidate) < 30:
                            continue
                        size = img.size
                        area = size['width'] * size['height']
                        if area < 10000:
                            continue
                        candidate_texts.append((area, text_candidate))
                    if candidate_texts:
                        candidate_texts.sort(reverse=True, key=lambda item: item[0])
                        image_text = candidate_texts[0][1]
                except Exception:
                    pass
                
                # Logic Fallback Link nếu chưa tìm thấy
                if post_link == "N/A":
                    try:
                        for a in all_links:
                            href = a.get_attribute("href")
                            if href and ("/user/" in href and "/groups/" in href):
                                post_link = href.split('?')[0]
                                break
                    except:
                        pass

                # Fallback Logic: Nếu raw_text quá ngắn, ưu tiên đắp bằng image_text ngay tại đây
                if len(raw_text) < 10 and image_text:
                    raw_text = image_text
                    image_text = None # Reset để AI không bị đọc trùng nội dung hai lần ở Prompt
                
                if len(raw_text) < 10: 
                    continue
                
                clean_text = re.sub(r'\s+', '', raw_text)
                preview_fingerprint = clean_text[:20] # Dùng để theo dõi box hiện tại sau khi bấm "Xem thêm"
                post_hash = hashlib.md5(preview_fingerprint.encode('utf-8')).hexdigest()
                
                if post_hash in processed_hashes:
                    continue

                if post_link != "N/A" and post_link in processed_links:
                    processed_hashes.add(post_hash)
                    continue

                if post_link == "N/A":
                    preview_skip = raw_text.replace('\n', ' ')[:20]
                    print(f"\n    [!] BỎ QUA ẨN DANH: '{preview_skip}...'")
                    processed_hashes.add(post_hash) 
                    continue

                found_new_post_on_screen = True
                print(f"\n--- Đang xử lý Bài đăng thứ {len(scraped_jobs) + 1} của {name_group} ---")
                
                driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", box)
                time.sleep(1.5)
                
                # Bấm Xem thêm
                see_more_btns = box.find_elements(By.XPATH, ".//*[contains(., 'Xem thêm') or contains(., 'See more')]")
                if see_more_btns:
                    try:
                        driver.execute_script("arguments[0].click();", see_more_btns[-1])
                        time.sleep(random.uniform(1.5, 2.5)) 
                        
                        fresh_boxes = driver.find_elements(By.XPATH, "//div[@data-ad-rendering-role='story_message' or @data-ad-comet-preview='message']")
                        for fbox in fresh_boxes:
                            fbox_text = fbox.text.strip()
                            if re.sub(r'\s+', '', fbox_text).startswith(preview_fingerprint):
                                box = fbox  
                                raw_text = fbox_text
                                break
                    except:
                        pass
                        
                raw_text = raw_text.replace("… Xem thêm", "").replace("Xem thêm", "").replace("Ẩn bớt", "").strip()
                preview_text = raw_text.replace('\n', ' ')[:60]
                print(f"    [Đọc] '{preview_text}...'")
                print(f"    + Link: {post_link}")

                if image_text and image_text in raw_text:
                    image_text = None

                # Lọc Rác Trước Khi Đưa AI Đọc (Heuristic)
                combined_check_text = raw_text + " " + (image_text or "")
                if not is_potential_job_post(combined_check_text):
                    print("    [!] BỎ QUA: Bị lọc từ sơ bộ (Không phải bài tuyển dụng hoặc là Rác/Spam).")
                    processed_hashes.add(post_hash)
                    if post_link != "N/A":
                        processed_links.add(post_link)
                    continue

                job_data = parse_post_with_ai(raw_text, post_link, name_group, image_text)
                
                if job_data == "INVALID":
                    print("    [!] BỎ QUA: AI xác nhận không phải bài tuyển dụng hợp lệ.")
                elif job_data:
                    job_data.pop("is_valid_job_post", None)
                    scraped_jobs.append(job_data)
                    print(f"    [★] LƯU THÀNH CÔNG: {job_data.get('title')}")

                processed_hashes.add(post_hash)
                if post_link != "N/A":
                    processed_links.add(post_link)
                
                scroll_attempts = 0
                break 

            except Exception as e:
                if "stale element" not in str(e):
                    print(f"    [LỖI] {e}")
                continue
                
        if not found_new_post_on_screen:
            print("    [*] Đang bám vào bài cuối cùng và cuộn xuống từ từ để quét...")
            current_boxes_scroll = driver.find_elements(By.XPATH, "//div[@data-ad-rendering-role='story_message' or @data-ad-comet-preview='message']")
            if current_boxes_scroll:
                driver.execute_script("arguments[0].scrollIntoView({block: 'start', behavior: 'smooth'});", current_boxes_scroll[-1])
            else:
                driver.execute_script("window.scrollBy(0, 500);")
            time.sleep(random.uniform(2, 4))
            scroll_attempts += 1
            
    return scraped_jobs

# ==========================================
# 4. CHẠY CHƯƠNG TRÌNH CHÍNH
# ==========================================
if __name__ == "__main__":
    reset_daily_crawl_counts()
    
    groups = get_active_fb_groups()
    
    if not groups:
        print("[!] Không có nhóm FB nào active để crawl.")
        exit()
    
    driver = setup_facebook_session()
    if not driver:
        print("[!] Không thể thiết lập phiên đăng nhập. Dừng chương trình.")
        exit()
    
    all_scraped_jobs = []
    
    global_processed_hashes = set()
    global_processed_links = set()
    
    try:
        for index, group in enumerate(groups):
            group_id = group['id']
            group_name = group['name']
            group_url = group['url']
            current_crawl_count = group['crawl_count_today']
            max_posts = group['max_posts_per_crawl']
            
            print(f"\n{'='*60}")
            print(f"CRAWLING GROUP [{index+1}/{len(groups)}]: {group_name}")
            print(f"URL: {group_url}")
            print(f"Đã crawl hôm nay: {current_crawl_count} lần")
            print(f"{'='*60}")
            
            scraped_jobs = scrape_single_group(
                driver, group_url, group_name, max_posts, 
                global_processed_hashes, global_processed_links
            )
            
            if scraped_jobs:
                all_scraped_jobs.extend(scraped_jobs)
                print(f"[✓] Crawl thành công {len(scraped_jobs)} jobs từ {group_name}")
            else:
                print(f"[!] Không crawl được job nào từ {group_name}")
            
            new_crawl_count = current_crawl_count + 1
            update_group_crawl_info(group_id, new_crawl_count)
            
            if index < len(groups) - 1:
                sleep_time = random.uniform(8, 10)
                print(f"[*] Đã xong nhóm này. Dừng {sleep_time:.1f} giây trước khi chuyển sang nhóm tiếp theo...")
                time.sleep(sleep_time)
                
    finally:
        print("\n[*] Đã hoàn tất danh sách nhóm. Tiến hành đóng trình duyệt.")
        driver.quit()
        
        if all_scraped_jobs:
            df = pd.DataFrame(all_scraped_jobs)
            columns_order = [
                'title', 'employer_name', 'raw_salary', 'min_salary', 'max_salary', 'salary_type',
                'city', 'address', 'job_type', 'experience_required', 'requirements', 
                'post_content', 'link', 'source'
            ]
            df = df[[col for col in columns_order if col in df.columns]]
            df.to_csv(CSV_FILE_PATH, index=False, encoding='utf-8-sig')
            print(f"\n=> [HOÀN TẤT] Đã lưu tổng cộng {len(all_scraped_jobs)} công việc vào '{CSV_FILE_PATH}'!")
        else:
            print("\n=> [THẤT BẠI] Không cào được công việc nào từ tất cả các nhóm.")