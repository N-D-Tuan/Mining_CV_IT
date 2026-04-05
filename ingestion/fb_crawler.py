import os
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time
import re

load_dotenv()
FB_EMAIL = os.getenv("FB_EMAIL")
FB_PASS = os.getenv("FB_PASS")

def extract_level(text):
    text_lower = text.lower()
    levels = ['intern', 'thực tập', 'fresher', 'junior', 'middle', 'senior', 'lead', 'manager']
    found_levels = [lvl for lvl in levels if lvl in text_lower]
    if 'thực tập' in found_levels and 'intern' not in found_levels:
        found_levels.remove('thực tập')
        found_levels.append('intern')
    return ", ".join(found_levels).title() if found_levels else "Không ghi rõ"

def extract_language(text):
    text_lower = text.lower()
    languages = ['php', 'c#', '.net', 'java', 'python', 'javascript', 'js', 'react', 'node', 'vue', 'golang', 'c++', 'ios', 'android', 'flutter', 'tester', 'qa', 'devops']
    found_langs = []
    for lang in languages:
        if lang == 'c#' and ('c#' in text_lower or 'c sharp' in text_lower):
            found_langs.append('C#')
        elif lang == '.net' and ('.net' in text_lower or 'asp.net' in text_lower):
            found_langs.append('.NET')
        elif lang == 'js' and ('js' in text_lower or 'javascript' in text_lower):
            found_langs.append('JavaScript')
        else:
            if re.search(r'\b' + re.escape(lang) + r'\b', text_lower):
                found_langs.append(lang.capitalize())
    return ", ".join(set(found_langs)) if found_langs else "Không ghi rõ"

def extract_city(text):
    text_lower = text.lower()
    if 'hà nội' in text_lower or 'ha noi' in text_lower or 'hn' in text_lower:
        return 'Hà Nội'
    elif 'hồ chí minh' in text_lower or 'ho chi minh' in text_lower or 'hcm' in text_lower or 'quận 1' in text_lower:
        return 'Hồ Chí Minh'
    elif 'đà nẵng' in text_lower or 'da nang' in text_lower or 'đn' in text_lower:
        return 'Đà Nẵng'
    else:
        return 'Không ghi rõ'

def crawl_fb_modern():
    if not FB_EMAIL or not FB_PASS:
        print("LỖI BẢO MẬT: Chưa cấu hình file .env.")
        return

    print("1. Đang khởi động trình duyệt ảo...")
    options = Options()
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    prefs = {"profile.default_content_setting_values.notifications": 2}
    options.add_experimental_option("prefs", prefs)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    print("\n--- TIẾN HÀNH TỰ ĐỘNG ĐIỀN THÔNG TIN ---")
    driver.get("https://www.facebook.com/")
    
    try:
        email_input = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "email")))
        pass_input = driver.find_element(By.ID, "pass")
        email_input.send_keys(FB_EMAIL)
        pass_input.send_keys(FB_PASS)
        print("-> Đã TỰ ĐỘNG ĐIỀN Email và Password thành công!")
        print("\n[HÀNH ĐỘNG CẦN THIẾT TỪ BẠN]")
        print("1. TỰ CLICK vào nút Đăng nhập trên Chrome ảo.")
        input("2. SAU KHI VÀO TRANG CHỦ, CLICK VÀO ĐÂY VÀ NHẤN [ENTER] ĐỂ CÀO DỮ LIỆU...")
    except:
        input("\nVui lòng tự đăng nhập bằng tay rồi nhấn [ENTER] tại đây để tiếp tục...")

    group_links = [
        "https://www.facebook.com/groups/vieclamcnttdanangnew",
        "https://www.facebook.com/groups/445083081399121"
    ]
    
    all_fb_jobs = []
    MAX_POSTS_PER_GROUP = 15
    MAX_SCROLLS = 7
    
    print("\n==================================================")
    print("BẮT ĐẦU CÀO DỮ LIỆU (CHẾ ĐỘ DEBUG - X-RAY)")
    print("==================================================")

    for group_url in group_links:
        print(f"\n============== ĐANG XỬ LÝ GROUP: {group_url} ==============")
        try:
            driver.get(group_url)
            time.sleep(5) 
            
            posts_collected = 0
            scroll_attempts = 0
            processed_texts = set() 
            
            while posts_collected < MAX_POSTS_PER_GROUP and scroll_attempts < MAX_SCROLLS:
                try:
                    # Bấm nút Xem thêm để bung bài viết
                    see_more_btns = driver.find_elements(By.XPATH, "//div[@role='button' and (contains(text(), 'Xem thêm') or contains(text(), 'See more'))]")
                    for btn in see_more_btns:
                        driver.execute_script("arguments[0].click();", btn)
                        time.sleep(0.5)
                except:
                    pass 
                
                articles = driver.find_elements(By.XPATH, "//div[@role='article']")
                print(f"\n-> Đang quét {len(articles)} khối nội dung trên màn hình (Cuộn lần {scroll_attempts+1}/{MAX_SCROLLS})...")

                for article in articles:
                    if posts_collected >= MAX_POSTS_PER_GROUP: break
                        
                    try:
                        content = article.text.strip()
                        
                        # X-RAY 1: Lọc độ dài giảm xuống 50
                        if len(content) < 50: 
                            continue
                        
                        # X-RAY 2: Chống trùng lặp bằng khúc GIỮA bài viết (từ ký tự 50 đến 100) để né Header chung của Group
                        content_fingerprint = content[50:100] if len(content) > 100 else content
                        if content_fingerprint in processed_texts:
                            continue
                        processed_texts.add(content_fingerprint)

                        keywords = ['tuyển', 'hiring', 'job', 'dev', 'developer', 'fresher', 'intern', 'thực tập', 'việc làm', 'cần tìm', 'tuyển dụng', 'lập trình', 'bổ sung', 'cần tuyển']
                        
                        # X-RAY 3: In ra lý do nếu bài viết bị loại vì thiếu Keyword
                        content_lower = content.lower()
                        if not any(kw in content_lower for kw in keywords):
                            # In ra 40 ký tự đầu để bạn xem bot đang đọc được chữ gì mà lại bỏ qua
                            clean_preview = content[:40].replace('\n', ' ')
                            print(f"   [Bỏ qua] Không có keyword tuyển dụng: '{clean_preview}...'")
                            continue

                        # Nếu qua được các màng lọc trên, tiến hành bóc tách
                        junk_words = ["Thích", "Trả lời", "Chia sẻ", "Bình luận", "Like", "Comment", "Share", "Gửi"]
                        for junk in junk_words:
                            content = re.sub(r'\b' + junk + r'\b', '', content, flags=re.IGNORECASE)
                        content = content.strip()
                        
                        city = extract_city(content)
                        level = extract_level(content)
                        language = extract_language(content)
                        
                        all_fb_jobs.append({
                            "Nguồn": group_url,
                            "Nội dung thô": content[:300] + "...", 
                            "Thành phố": city,
                            "Trình độ": level,
                            "Ngôn ngữ": language
                        })
                        posts_collected += 1
                        print(f"+++ [THÀNH CÔNG] Đã bóc tách bài {posts_collected}: {level} - {language} tại {city} +++")
                        
                    except Exception as e:
                        continue
                
                if posts_collected < MAX_POSTS_PER_GROUP:
                    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(4) 
                    scroll_attempts += 1
                else:
                    break

        except Exception as e:
            print(f"Có lỗi khi xử lý group này: {e}")

    try:
        driver.quit()
    except:
        pass

    df = pd.DataFrame(all_fb_jobs)
    
    if not df.empty:
        print("\n==================================================")
        print(f"TỔNG KẾT: Đã thu thập thành công {len(df)} bài đăng FB!")
        df.to_csv("test_facebook_jobs_modern.csv", index=False, encoding='utf-8-sig')
        print("Đã lưu vào file: test_facebook_jobs_modern.csv")
    else:
        print("\nKhông bóc tách được bài nào hợp lệ. Hãy đọc log [Bỏ qua] ở trên để biết nguyên nhân.")

if __name__ == "__main__":
    crawl_fb_modern()