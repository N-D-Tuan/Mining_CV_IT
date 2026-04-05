from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

def extract_level(text):
    text_lower = text.lower()
    levels = ['intern', 'thực tập', 'fresher', 'junior', 'middle', 'senior', 'lead', 'manager', 'principal']
    found_levels = [lvl for lvl in levels if lvl in text_lower]
    if 'thực tập' in found_levels and 'intern' not in found_levels:
        found_levels.remove('thực tập')
        found_levels.append('intern')
    return ", ".join(found_levels).title() if found_levels else "Không ghi rõ"

def extract_language(text):
    text_lower = text.lower()
    languages = ['php', 'c#', '.net', 'java', 'python', 'javascript', 'js', 'react', 'node', 'vue', 'golang', 'c++', 'ios', 'android', 'flutter', 'tester', 'qa', 'devops', 'aws', 'sql']
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

def crawl_itviec_test():
    print("1. Đang khởi động trình duyệt ảo (Chế độ Tàng hình Full Auto)...")
    options = Options()
    
    # CÁC THUỘC TÍNH ANTI-DETECT (CHỐNG PHÁT HIỆN BOT)
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    # TIÊM JAVASCRIPT ĐỂ XÓA CỜ WEBDRIVER
    driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
        'source': 'Object.defineProperty(navigator, "webdriver", {get: () => undefined})'
    })
    
    targets = [
        {"city": "Đà Nẵng", "url": "https://itviec.com/it-jobs/da-nang"},
        {"city": "Hồ Chí Minh", "url": "https://itviec.com/it-jobs/ho-chi-minh-hcm"},
        {"city": "Hà Nội", "url": "https://itviec.com/it-jobs/ha-noi"}
    ]
    
    all_jobs_data = []
    MAX_JOBS_PER_CITY = 40 # Nâng lên 40 để ép bot phải chạy sang Trang 2
    CSV_FILENAME = "test_itviec_jobs_paged.csv"
    
    print("==================================================")
    print(f"BẮT ĐẦU CÀO DỮ LIỆU ITVIEC (GIỚI HẠN {MAX_JOBS_PER_CITY} BÀI/THÀNH PHỐ)")
    print("==================================================")

    for target in targets:
        city_name = target["city"]
        base_url = target["url"]
        
        print(f"\n=> Đang xử lý thành phố: {city_name}...")
        
        jobs_collected_for_city = 0
        page = 1 # Khởi tạo biến trang
        
        # VÒNG LẶP PHÂN TRANG
        while jobs_collected_for_city < MAX_JOBS_PER_CITY:
            target_url = f"{base_url}?page={page}"
            print(f" -> Truy cập Trang {page}...")
            
            try:
                driver.get(target_url)
                time.sleep(4) 
                
                # Vượt rào Cloudflare
                page_source = driver.page_source.lower()
                if "cloudflare" in page_source or "just a moment" in page_source or "security verification" in page_source:
                    print("   [Hệ thống] Đang tự động vượt rào Cloudflare...")
                    time.sleep(6) 
                
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
                time.sleep(2)
                
                html = driver.page_source
                soup = BeautifulSoup(html, 'html.parser')
                
                job_cards = soup.find_all('div', class_=lambda c: c and 'job-card' in c)
                
                if not job_cards:
                    print(f"   -> Trang {page} trống. Đã cào hết việc ở {city_name}.")
                    break

                print(f"   -> Tìm thấy {len(job_cards)} khối công việc ở Trang {page}. Đang bóc tách...")

                for card in job_cards:
                    if jobs_collected_for_city >= MAX_JOBS_PER_CITY:
                        break 
                        
                    try:
                        # 1. Trích xuất Tiêu đề
                        title_tag = card.find(['h2', 'h3'])
                        if not title_tag: continue
                        title = title_tag.text.strip()
                        
                        # 2. TRÍCH XUẤT LINK (BẢN VÁ TỐI THƯỢNG)
                        link = 'N/A'
                        
                        # Cách 1: Tìm tất cả thẻ <a> trong cả khối card, loại trừ link công ty (/companies/)
                        all_a_tags = card.find_all('a', href=True)
                        for a in all_a_tags:
                            href = a['href']
                            if '/it-jobs/' in href or '/job/' in href:
                                link = href
                                break # Đã tìm thấy link việc, thoát vòng lặp nhỏ này
                        
                        # Cách 2 (Dự phòng): Nếu ITviec dùng thẻ <a> trắng bọc toàn bộ khối card
                        if link == 'N/A' and card.name == 'a' and card.has_attr('href'):
                            if '/it-jobs/' in card['href']:
                                link = card['href']

                        # Chẩn hóa Link cuối cùng
                        if link != 'N/A' and not link.startswith('http'):
                            link = "https://itviec.com" + link

                        # Đảm bảo bài nào không có link (N/A) thì vứt luôn để không làm rác DB
                        if link == 'N/A' or link == 'https://itviec.com':
                            continue 

                        # 3. Trích xuất Công ty
                        company = "Không ghi rõ"
                        img = card.find('img')
                        if img and img.get('alt'):
                            company = img.get('alt').replace(' Logo', '').replace(' logo', '').strip()

                        # 4. Trích xuất Lương (ITviec giấu lương nên thường sẽ trả về "Đăng nhập để xem")
                        salary = "Đăng nhập để xem"
                        raw_text = card.get_text(separator=' ', strip=True)
                        if "Sign in to view salary" not in raw_text and "Đăng nhập" not in raw_text:
                            salary_match = re.search(r'(\$[\d,]+(?: - \$[\d,]+)?|[\d,]+(?: - [\d,]+)?\s*(VND|triệu|tr|USD))', raw_text, re.IGNORECASE)
                            if salary_match:
                                salary = salary_match.group(1)

                        # 5. Kinh nghiệm, Level, Ngôn ngữ
                        experience = "Không ghi rõ"
                        exp_match = re.search(r'(\d+)\s*(year|years|năm)', raw_text, re.IGNORECASE)
                        if exp_match:
                            experience = exp_match.group(0)

                        level = extract_level(title + " " + raw_text)
                        language = extract_language(title + " " + raw_text)

                        all_jobs_data.append({
                            "Tiêu đề": title,
                            "Công ty": company,
                            "Mức lương": salary,
                            "Thành phố": city_name, 
                            "Kinh nghiệm": experience,
                            "Trình độ": level,
                            "Ngôn ngữ": language,
                            "Link": link
                        })
                        jobs_collected_for_city += 1
                        
                    except Exception as e:
                        continue
                        
                print(f"   -> Tiến độ {city_name}: {jobs_collected_for_city}/{MAX_JOBS_PER_CITY} bài.")
                page += 1 
                time.sleep(2) 

            except Exception as e:
                print(f"Lỗi khi xử lý trang {page} ở {city_name}: {e}.")
                break 
                
        # Lưu cuốn chiếu sau khi xong 1 thành phố
        df = pd.DataFrame(all_jobs_data)
        df.to_csv(CSV_FILENAME, index=False, encoding='utf-8-sig')
        print(f"-> [Đã lưu an toàn tiến độ vào {CSV_FILENAME}]")

    try:
        driver.quit()
    except:
        pass
        
    print("\n==================================================")
    print(f"TỔNG KẾT: Hoàn thành tiến trình. Thu thập tổng cộng {len(all_jobs_data)} bài từ ITviec.")
    print("==================================================")

if __name__ == "__main__":
    crawl_itviec_test()