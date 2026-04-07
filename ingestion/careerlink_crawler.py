from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import pandas as pd
import time
import re
import requests

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

def crawl_careerlink():
    print("1. Đang khởi động Crawler V3 (Bóc tách chuẩn DOM + Pagination thông minh)...")
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
        'source': 'Object.defineProperty(navigator, "webdriver", {get: () => undefined})'
    })
    driver.set_page_load_timeout(30)
    
    all_jobs_data = []
    CSV_FILENAME = "test_careerlink_jobs_paged.csv"
    req_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    }
    
    # Khởi tạo URL ban đầu
    target_url = "https://www.careerlink.vn/viec-lam/k/it/cntt-phan-mem/19?order=date&province_codes=HCM%2CDN%2CHN&sort=desc"
    page = 1
    visited_links = set() 
    
    print("==================================================")
    print("BẮT ĐẦU CÀO CAREERLINK")
    print("==================================================")

    while True:
        print(f"\n=> Đang tải Trang {page}...")
        
        try:
            driver.get(target_url)
            time.sleep(3) 
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(1)
            
            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            
            # TÌM CHÍNH XÁC CÁC KHỐI CÔNG VIỆC (Dựa theo ảnh DevTools của bạn)
            job_items = soup.find_all('li', class_=re.compile(r'job-item'))
            
            if not job_items:
                print(f" -> Trang {page} không có danh sách công việc. KẾT THÚC.")
                break
                
            print(f" -> Tìm thấy {len(job_items)} thẻ bài. Bắt đầu xử lý...")

            for item in job_items:
                try:
                    # 1. BÓC TIÊU ĐỀ VÀ LINK TỪ TRANG DANH SÁCH (100% CHÍNH XÁC)
                    a_link = item.find('a', class_=re.compile(r'job-link'))
                    if not a_link: continue
                    
                    title = a_link.get('title', '').strip()
                    if not title: title = a_link.text.strip()
                    
                    link = a_link.get('href', '')
                    if not link.startswith('http'): link = "https://www.careerlink.vn" + link
                    
                    if link in visited_links: continue
                    visited_links.add(link)

                    # 2. BÓC TÊN CÔNG TY TỪ TRANG DANH SÁCH (Dựa theo thẻ job-company)
                    company_tag = item.find('a', class_=re.compile(r'job-company'))
                    company = company_tag.get('title', '').strip() if company_tag else "Không ghi rõ"
                    if not company and company_tag: company = company_tag.text.strip()

                    # 3. KÉO API LẤY THÊM LƯƠNG, KINH NGHIỆM TỪ TRANG CHI TIẾT
                    salary = "Thoả thuận"
                    city = "Không ghi rõ"
                    experience = "Không ghi rõ"
                    
                    res = requests.get(link, headers=req_headers, timeout=5)
                    if res.status_code == 200:
                        detail_soup = BeautifulSoup(res.text, 'html.parser')
                        detail_text = detail_soup.get_text(separator=' | ', strip=True)

                        # Lương
                        salary_match = re.search(r'([\d,\.]+\s*-\s*[\d,\.]+\s*(Triệu|Tr|VND|USD)|Lên đến\s*[\d,\.]+\s*(Triệu|Tr)|Thương lượng|Cạnh tranh|Thoả thuận)', detail_text, re.IGNORECASE)
                        if salary_match: salary = salary_match.group(0).strip()

                        # Thành phố
                        if "Hà Nội" in detail_text or "Ha Noi" in detail_text: city = "Hà Nội"
                        elif "Hồ Chí Minh" in detail_text or "HCM" in detail_text: city = "Hồ Chí Minh"
                        elif "Đà Nẵng" in detail_text or "Da Nang" in detail_text: city = "Đà Nẵng"

                        # Kinh nghiệm
                        exp_match = re.search(r'(\d+\s*-\s*\d+\s*năm(?:\s*kinh nghiệm)?)|(\d+\s*năm(?:\s*kinh nghiệm)?)|(Dưới\s*\d+\s*năm(?:\s*kinh nghiệm)?)|(Không yêu cầu(?:\s*kinh nghiệm)?)', detail_text, re.IGNORECASE)
                        if exp_match: experience = exp_match.group(0).strip()

                    level = extract_level(title + " " + detail_text if res.status_code == 200 else title)
                    language = extract_language(title + " " + detail_text if res.status_code == 200 else title)

                    # Gom vào Data
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
                    print(f"   + {title[:30]} | {company[:20]} | {experience}")
                    
                    time.sleep(0.5) # Nghỉ xả hơi nhẹ

                except Exception as e:
                    continue

            # TÌM NÚT TRANG TIẾP THEO (CHUẨN XÁC)
            next_page_btn = soup.find('a', rel='next')
            if next_page_btn and next_page_btn.get('href'):
                target_url = "https://www.careerlink.vn" + next_page_btn['href']
                print(f" -> Chuẩn bị lật sang trang {page + 1}")
                page += 1
            else:
                print(f" -> Không tìm thấy nút Next. KẾT THÚC CÀO TOÀN BỘ.")
                break
                
            # Lưu file 
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
    print(f"TỔNG KẾT: Đã cào được {len(all_jobs_data)} bài chuẩn xác 100%.")
    print("==================================================")

if __name__ == "__main__":
    crawl_careerlink()