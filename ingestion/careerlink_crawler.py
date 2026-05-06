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

def crawl_careerlink():
    print("1. Đang khởi động Crawler (Selenium Thuần - Chậm rãi & An toàn)...")
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
    CSV_FILENAME = "test_careerlink_jobs_paged.csv"
    
    target_url = "https://www.careerlink.vn/viec-lam/k/it/cntt-phan-mem/19?page=1&order=date&province_codes=HCM%2CDN%2CHN&sort=desc"
    visited_links = set() 
    
    print("==================================================")
    print("BẮT ĐẦU CÀO CAREERLINK (1 TRANG - KHÔNG DÙNG API)")
    print("==================================================")

    print(f"\n=> Đang tải Trang Danh Sách...")
    
    try:
        driver.get(target_url)
        
        # RADAR CAPTCHA
        for _ in range(15):
            page_source = driver.page_source.lower()
            if "job-item" in page_source:
                break 
            if "cloudflare" in page_source or "robot" in page_source or "xác minh" in page_source:
                print("   [CẢNH BÁO] Đụng Captcha! Vui lòng click 'Tôi không phải robot' trên cửa sổ Chrome!")
                time.sleep(2)
            else:
                time.sleep(2)
                
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
        time.sleep(2)
        
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        job_items = soup.find_all('li', class_=re.compile(r'job-item'))
        
        if not job_items:
            print(" -> Không tải được danh sách việc làm. KẾT THÚC.")
        else:
            print(f" -> Tìm thấy {len(job_items)} công việc. Bắt đầu mô phỏng người dùng...\n")

            for item in job_items:
                try:
                    a_link = item.find('a', class_=re.compile(r'job-link'))
                    if not a_link: continue
                    
                    title = a_link.get('title', '').strip()
                    if not title: title = a_link.text.strip()
                    
                    link = a_link.get('href', '')
                    if not link.startswith('http'): link = "https://www.careerlink.vn" + link
                    
                    if link in visited_links: continue
                    visited_links.add(link)

                    company_tag = item.find('a', class_=re.compile(r'job-company'))
                    company = company_tag.get('title', '').strip() if company_tag else "Không ghi rõ"
                    if not company and company_tag: company = company_tag.text.strip()

                    # ==================================================
                    # MỞ TAB MỚI ĐỂ VÀO TRANG CHI TIẾT (An toàn tuyệt đối)
                    # ==================================================
                    driver.execute_script("window.open('');")
                    driver.switch_to.window(driver.window_handles[1])
                    
                    salary = "Thoả thuận"
                    city = "Không ghi rõ"
                    experience = "Không ghi rõ"
                    detail_text = ""
                    
                    try:
                        driver.get(link)
                        time.sleep(2) # Chờ trang load xong
                        
                        detail_soup = BeautifulSoup(driver.page_source, 'html.parser')
                        detail_text = detail_soup.get_text(separator=' | ', strip=True)

                        salary_match = re.search(r'([\d,\.]+\s*-\s*[\d,\.]+\s*(Triệu|Tr|VND|USD)|Lên đến\s*[\d,\.]+\s*(Triệu|Tr)|Thương lượng|Cạnh tranh|Thoả thuận)', detail_text, re.IGNORECASE)
                        if salary_match: salary = salary_match.group(0).strip()

                        if "Hà Nội" in detail_text or "Ha Noi" in detail_text: city = "Hà Nội"
                        elif "Hồ Chí Minh" in detail_text or "HCM" in detail_text: city = "Hồ Chí Minh"
                        elif "Đà Nẵng" in detail_text or "Da Nang" in detail_text: city = "Đà Nẵng"

                        exp_match = re.search(r'(\d+\s*-\s*\d+\s*năm(?:\s*kinh nghiệm)?)|(\d+\s*năm(?:\s*kinh nghiệm)?)|(Dưới\s*\d+\s*năm(?:\s*kinh nghiệm)?)|(Không yêu cầu(?:\s*kinh nghiệm)?)', detail_text, re.IGNORECASE)
                        if exp_match: experience = exp_match.group(0).strip()

                    except Exception as e:
                        pass
                    finally:
                        driver.close() # Đóng tab
                        driver.switch_to.window(driver.window_handles[0]) # Trở về trang gốc
                    # ==================================================

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
                    
                    print(f" + {title[:75]:<75} | {company[:50]:<50} | {experience}")

                except Exception as e:
                    continue

        df = pd.DataFrame(all_jobs_data)
        df.to_csv(CSV_FILENAME, index=False, encoding='utf-8-sig')

    except Exception as e:
        print(f"Lỗi hệ thống: {e}. Dừng cào.")

    finally:
        try:
            driver.quit()
        except:
            pass
        
    print("\n==================================================")
    print(f"TỔNG KẾT: Đã cào được {len(all_jobs_data)} bài chuẩn xác từ CareerLink.")
    print("==================================================")

if __name__ == "__main__":
    crawl_careerlink()