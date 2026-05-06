from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
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

def crawl_vnworks():
    print("1. Đang khởi động Crawler VietnamWorks (Fix lỗi Công ty & Cào 2 Trang)...")
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
        'source': 'Object.defineProperty(navigator, "webdriver", {get: () => undefined})'
    })
    driver.set_page_load_timeout(60)
    
    all_jobs_data = []
    CSV_FILENAME = "test_vnworks_jobs_paged.csv"
    visited_links = set() 
    
    print("==================================================")
    print("BẮT ĐẦU CÀO VIETNAMWORKS (MAX 2 TRANG)")
    print("==================================================")

    # CHỈ LẶP TỪ TRANG 1 ĐẾN TRANG 2 (range(1, 3) nghĩa là 1 và 2)
    for page in range(1, 3):
        target_url = f"https://www.vietnamworks.com/viec-lam?q=it&l=24.29.17&sorting=lasted&page={page}"
        print(f"\n=> Đang tải Trang Danh Sách {page}...")
        
        try:
            driver.get(target_url)
            time.sleep(random.uniform(4.0, 6.0))
            
            page_source = driver.page_source.lower()
            if "cloudflare" in page_source or "xác minh" in page_source or "robot" in page_source:
                print("   [CẢNH BÁO] Đụng Captcha! Vui lòng click 'Tôi không phải robot' trên cửa sổ Chrome! (Chờ 15s)")
                time.sleep(15)
                
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            
            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            
            job_links = soup.find_all('a', href=re.compile(r'-jv/?$|-jv\?'))
            unique_links = set()
            for a in job_links:
                href = a.get('href', '')
                if not href.startswith('http'): 
                    href = "https://www.vietnamworks.com" + href
                if href not in visited_links:
                    unique_links.add(href)

            if not unique_links:
                print(f" -> Trang {page} không tìm thấy link việc làm mới. KẾT THÚC CÀO TRANG NÀY.")
                continue

            print(f" -> Tìm thấy {len(unique_links)} công việc. Bắt đầu bóc tách...\n")

            for i, link in enumerate(unique_links):
                visited_links.add(link)
                try:
                    driver.get(link)
                    time.sleep(random.uniform(2.5, 4.0)) 
                    
                    detail_soup = BeautifulSoup(driver.page_source, 'html.parser')
                    detail_text = detail_soup.get_text(separator=' | ', strip=True)

                    title_tag = detail_soup.find('h1')
                    title = title_tag.text.strip() if title_tag else "Không rõ tiêu đề"

                    # ========================================================
                    # FIX LỖI TÊN CÔNG TY (LỌC TỪ KHÓA RÁC)
                    # ========================================================
                    company = "Không ghi rõ"
                    ignore_texts = ["trang văn hóa công ty", "company culture", "xem công ty", "view company", "tất cả việc làm", "về chúng tôi", "việc làm"]
                    
                    company_tags = detail_soup.find_all('a', href=re.compile(r'/nha-tuyen-dung/|/company/|/cong-ty/'))
                    for tag in company_tags:
                        txt = tag.text.strip()
                        if txt and txt.lower() not in ignore_texts and "việc làm" not in txt.lower():
                            company = txt
                            break
                            
                    # Nếu vẫn không tìm được, cố gắng cào thẻ p/h2 nằm gần H1
                    if company == "Không ghi rõ":
                        try:
                            links_near_h1 = title_tag.parent.parent.find_all('a')
                            for l in links_near_h1:
                                if l.text.strip() and l.text.strip() != title:
                                    company = l.text.strip()
                                    break
                        except: pass
                    # ========================================================

                    experience = "Không ghi rõ"
                    exp_label = detail_soup.find(lambda tag: tag.name == 'label' and 'kinh nghiệm' in tag.text.lower())
                    if exp_label:
                        exp_val = exp_label.find_next_sibling(['p', 'span', 'div'])
                        if exp_val:
                            experience = exp_val.text.strip()
                            
                    if experience == "Không ghi rõ":
                        exp_match = re.search(r'(\d+\s*-\s*\d+\s*năm(?:\s*kinh nghiệm)?)|(\d+\s*năm(?:\s*kinh nghiệm)?)|(Dưới\s*\d+\s*năm(?:\s*kinh nghiệm)?)|(Không yêu cầu(?:\s*kinh nghiệm)?)|(Chưa có kinh nghiệm)', detail_text, re.IGNORECASE)
                        if exp_match: experience = exp_match.group(0).strip()

                    salary = "Thoả thuận"
                    sal_label = detail_soup.find(lambda tag: tag.name == 'label' and 'mức lương' in tag.text.lower())
                    if sal_label:
                        sal_val = sal_label.find_next_sibling(['p', 'span', 'div'])
                        if sal_val:
                            salary = sal_val.text.strip()
                            
                    if salary == "Thoả thuận":
                        salary_match = re.search(r'([\d,\.]+\s*-\s*[\d,\.]+\s*(Triệu|Tr|VND|USD)|Lên đến\s*[\d,\.]+\s*(Triệu|Tr|USD)|Thương lượng|Cạnh tranh|Thoả thuận|Thỏa thuận)', detail_text, re.IGNORECASE)
                        if salary_match: salary = salary_match.group(0).strip()

                    city = "Không ghi rõ"
                    if "Hà Nội" in detail_text or "Ha Noi" in detail_text or "Hà Nội" in detail_text: city = "Hà Nội"
                    elif "Hồ Chí Minh" in detail_text or "HCM" in detail_text or "Ho Chi Minh" in detail_text: city = "Hồ Chí Minh"
                    elif "Đà Nẵng" in detail_text or "Da Nang" in detail_text: city = "Đà Nẵng"

                    level = extract_level(title + " " + detail_text)
                    language = extract_language(title + " " + detail_text)

                    all_jobs_data.append({
                        "Tiêu đề": title,
                        "Công ty": company,
                        "Mức lương": salary,
                        "Thành phố": city,      
                        "Kinh nghiệm": experience,
                        "Trình độ": level,
                        "Ngôn ngữ": language,
                        "Link": link
                    })
                    
                    print(f" + [{i+1:02d}] {title[:65]:<65} | {company[:35]:<35} | {experience}")

                except Exception as e:
                    print(f"   [-] Bỏ qua bài do lỗi tải trang: {link}")
                    time.sleep(random.uniform(2.0, 4.0))
                    continue
                
            df = pd.DataFrame(all_jobs_data)
            df.to_csv(CSV_FILENAME, index=False, encoding='utf-8-sig')

        except Exception as e:
            print(f"Lỗi bất ngờ ở trang {page}: {e}. Dừng cào.")
            break 

    try:
        driver.quit()
    except:
        pass
        
    print("\n==================================================")
    print(f"TỔNG KẾT: Đã cào an toàn {len(all_jobs_data)} bài từ {CSV_FILENAME}.")
    print("==================================================")

if __name__ == "__main__":
    crawl_vnworks()