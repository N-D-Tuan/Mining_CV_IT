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

def crawl_topdev():
    print("1. Đang khởi động Crawler TopDev (Cơ chế Lưới lọc Thành phố 2 tầng)...")
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
        'source': 'Object.defineProperty(navigator, "webdriver", {get: () => undefined})'
    })
    driver.set_page_load_timeout(60)
    
    all_jobs_data = []
    CSV_FILENAME = "test_topdev_jobs_paged.csv"
    
    print("==================================================")
    print("BẮT ĐẦU CÀO TOPDEV (MAX 3 TRANG - CHẬM MÀ CHẮC)")
    print("==================================================")

    base_url = "https://topdev.vn/jobs/search?job_categories_ids=2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12%2C13%2C67&ordering=newest_refresh&keyword=&region_ids=79%2C01%2C48"
    
    for page in range(1, 4):
        target_url = f"{base_url}&page={page}"
        print(f"\n=> Đang tải Trang Danh Sách {page}...")
        
        try:
            driver.get(target_url)
            time.sleep(random.uniform(4.0, 6.0))
            
            page_title = driver.title.lower()
            if "just a moment" in page_title or "cloudflare" in page_title:
                print("   [CẢNH BÁO] Đụng Captcha! Vui lòng click 'Tôi không phải robot' trên cửa sổ Chrome! (Chờ 15s)")
                time.sleep(15)
                
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight/3);")
            time.sleep(1)
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight/1.5);")
            time.sleep(1)
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            
            job_links_candidates = soup.find_all('a', href=re.compile(r'/detail-jobs/'))
            
            jobs_list = []
            unique_links = set()
            
            for a_tag in job_links_candidates:
                href = a_tag.get('href', '')
                full_link = href if href.startswith('http') else "https://topdev.vn" + href
                
                if full_link not in unique_links:
                    unique_links.add(full_link)
                    
                    # 1. BÓC TIÊU ĐỀ
                    title = a_tag.text.strip()
                    
                    # 2. BÓC CÔNG TY
                    company = "Không ghi rõ"
                    company_span = a_tag.find_next_sibling('span')
                    if company_span:
                        company = company_span.text.strip()
                    else:
                        parent_div = a_tag.parent
                        if parent_div:
                            span = parent_div.find('span')
                            if span:
                                company = span.text.strip()
                                
                    # ========================================================
                    # LƯỚI LỌC TẦNG 1: TÌM THÀNH PHỐ Ở TRANG TỔNG
                    # ========================================================
                    job_card = a_tag.find_parent('div', class_=re.compile(r'relative flex flex-col'))
                    if not job_card:
                        job_card = a_tag.parent.parent.parent.parent
                        
                    card_text = job_card.get_text(separator=' ', strip=True) if job_card else ""
                    
                    city = "Không ghi rõ"
                    if "Hà Nội" in card_text or "Ha Noi" in card_text or "Hà Nội" in card_text: city = "Hà Nội"
                    elif "Hồ Chí Minh" in card_text or "HCM" in card_text or "Ho Chi Minh" in card_text: city = "Hồ Chí Minh"
                    elif "Đà Nẵng" in card_text or "Da Nang" in card_text: city = "Đà Nẵng"
                    # ========================================================
                    
                    jobs_list.append({
                        'title': title,
                        'company': company,
                        'link': full_link,
                        'city': city
                    })

            if not jobs_list:
                print(f" -> Trang {page} không tìm thấy link việc làm mới. KẾT THÚC CÀO TRANG NÀY.")
                continue

            print(f" -> Tìm thấy {len(jobs_list)} công việc. Bắt đầu vào trang chi tiết...\n")

            for i, job in enumerate(jobs_list):
                try:
                    driver.get(job['link'])
                    time.sleep(random.uniform(2.0, 3.5)) 
                    
                    detail_soup = BeautifulSoup(driver.page_source, 'html.parser')
                    
                    # Cắt Footer và Header để chống nhiễu địa lý
                    for foot in detail_soup.find_all('footer'):
                        foot.decompose()
                    for nav in detail_soup.find_all('nav'):
                        nav.decompose()
                    
                    detail_text = detail_soup.get_text(separator=' | ', strip=True)
                    
                    if "just a moment" in driver.title.lower() or "cloudflare" in driver.title.lower():
                        print(f"   [!] Cloudflare đang chặn ở bài {i+1}. Tự động chờ xác minh ngầm...")
                        time.sleep(12)
                        detail_soup = BeautifulSoup(driver.page_source, 'html.parser')
                        for foot in detail_soup.find_all('footer'): foot.decompose()
                        detail_text = detail_soup.get_text(separator=' | ', strip=True)

                    # KINH NGHIỆM
                    experience = "Không ghi rõ"
                    exp_match = re.search(r'(\d+\s*-\s*\d+\s*năm(?:\s*kinh nghiệm)?)|(\d+\s*(năm|year)s?(?:\s*kinh nghiệm|experience)?)|(Dưới\s*\d+\s*năm(?:\s*kinh nghiệm)?)|(Không yêu cầu(?:\s*kinh nghiệm)?)|(Chưa có kinh nghiệm)|(No experience)', detail_text, re.IGNORECASE)
                    if exp_match: 
                        experience = exp_match.group(0).strip()

                    # LƯƠNG
                    salary = "Thoả thuận"
                    salary_match = re.search(r'([\d,\.]+\s*-\s*[\d,\.]+\s*(Triệu|Tr|VND|VNĐ|USD)|\$[\d,\.]+\s*-\s*\$[\d,\.]+|Lên đến\s*[\d,\.]+\s*(Triệu|Tr|USD)|Up to\s*[\d,\.]+\s*(USD|VND|Triệu)|Thương lượng|Cạnh tranh|Thoả thuận|Thỏa thuận|You\'ll love it)', detail_text, re.IGNORECASE)
                    if salary_match: 
                        salary = salary_match.group(0).strip()

                    # ========================================================
                    # LƯỚI LỌC TẦNG 2: TÌM THÀNH PHỐ Ở TRANG CHI TIẾT
                    # Khởi tạo bằng kết quả ở Tầng 1
                    # ========================================================
                    final_city = job['city']
                    
                    # Nếu Tầng 1 (thẻ ngoài) thất bại, quét tiếp Tầng 2 (trang chi tiết)
                    if final_city == "Không ghi rõ":
                        if "Hồ Chí Minh" in detail_text or "HCM" in detail_text or "Ho Chi Minh" in detail_text: 
                            final_city = "Hồ Chí Minh"
                        elif "Hà Nội" in detail_text or "Ha Noi" in detail_text or "Hà Nội" in detail_text: 
                            final_city = "Hà Nội"
                        elif "Đà Nẵng" in detail_text or "Da Nang" in detail_text: 
                            final_city = "Đà Nẵng"
                    # ========================================================

                    level = extract_level(job['title'] + " " + detail_text)
                    language = extract_language(job['title'] + " " + detail_text)

                    all_jobs_data.append({
                        "Tiêu đề": job['title'],
                        "Công ty": job['company'],
                        "Mức lương": salary,
                        "Thành phố": final_city,      
                        "Kinh nghiệm": experience,
                        "Trình độ": level,
                        "Ngôn ngữ": language,
                        "Link": job['link']
                    })
                    
                    print(f" + [{i+1:02d}] {job['title'][:55]:<55} | {final_city[:15]:<15} | {salary}")

                except Exception as e:
                    print(f"   [-] Bỏ qua bài do lỗi tải trang: {job['link']}")
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
    crawl_topdev()