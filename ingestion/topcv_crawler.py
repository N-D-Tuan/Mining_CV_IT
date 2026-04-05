from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

def clean_title(raw_title):
    cleaned = re.sub(r'^(HOT|Nổi bật|Tin mới|Tuyển gấp)\s*', '', raw_title, flags=re.IGNORECASE).strip()
    return cleaned

def extract_level(title):
    title_lower = title.lower()
    levels = ['intern', 'thực tập', 'fresher', 'junior', 'middle', 'senior', 'lead', 'manager']
    found_levels = [lvl for lvl in levels if lvl in title_lower]
    
    if 'thực tập' in found_levels and 'intern' not in found_levels:
        found_levels.remove('thực tập')
        found_levels.append('intern')
        
    return ", ".join(found_levels).title() if found_levels else "Không ghi rõ"

def extract_language(title):
    title_lower = title.lower()
    languages = ['php', 'c#', '.net', 'java', 'python', 'javascript', 'react', 'node', 'vue', 'angular', 'golang', 'ruby', 'c++', 'ios', 'android', 'flutter', 'sql']
    found_langs = []
    
    for lang in languages:
        if lang == 'c#' and ('c#' in title_lower or 'c sharp' in title_lower):
            found_langs.append('C#')
        elif lang == '.net' and ('.net' in title_lower or 'asp.net' in title_lower):
            found_langs.append('.NET')
        else:
            if re.search(r'\b' + re.escape(lang) + r'\b', title_lower):
                found_langs.append(lang.capitalize())
                
    return ", ".join(set(found_langs)) if found_langs else "Không ghi rõ"

def extract_city(location_text):
    loc_lower = location_text.lower()
    if 'hà nội' in loc_lower or 'ha noi' in loc_lower:
        return 'Hà Nội'
    elif 'hồ chí minh' in loc_lower or 'ho chi minh' in loc_lower or 'hcm' in loc_lower:
        return 'Hồ Chí Minh'
    elif 'đà nẵng' in loc_lower or 'da nang' in loc_lower:
        return 'Đà Nẵng'
    else:
        return 'Khác'

def crawl_test_5_pages():
    print("1. Đang khởi động trình duyệt ảo (Chrome)...")
    options = Options()
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    base_url = "https://www.topcv.vn/tim-viec-lam-software-engineering-tai-ha-noi-l1cr257cb258?type_keyword=0&sba=1&category_family=r257~b258&locations=l1_l2_l8&saturday_status=0"
    
    all_jobs_data = []
    page = 1
    previous_first_link = None 
    MAX_TEST_PAGES = 5 
    
    print("==================================================")
    print(f"CHẾ ĐỘ TEST: CHỈ CÀO TỐI ĐA {MAX_TEST_PAGES} TRANG")
    print("==================================================")

    while page <= MAX_TEST_PAGES:
        url = f"{base_url}&page={page}"
        print(f"\n=> Đang xử lý TRANG {page}/{MAX_TEST_PAGES}...")
        
        driver.get(url)
        time.sleep(5) 
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
        time.sleep(3) 
        
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        
        job_items = soup.find_all('div', class_=lambda c: c and 'job-item' in c) 
        
        if len(job_items) == 0:
            print(f"-> Trang {page} trống. Đã chạm đáy dữ liệu sớm hơn dự kiến!")
            break
            
        first_a_tag = job_items[0].find('a', href=True)
        current_first_link = first_a_tag['href'] if first_a_tag else str(job_items[0])
        
        if current_first_link == previous_first_link:
            print(f"-> PHÁT HIỆN LẶP LẠI: Dữ liệu trang {page} giống hệt trang trước. Đã đến trang cuối cùng!")
            break
            
        previous_first_link = current_first_link
            
        print(f"-> Tìm thấy {len(job_items)} công việc. Đang trích xuất...")

        for item in job_items:
            try:
                title_element = item.find('h3')
                if not title_element:
                    title_element = item.find('a', target='_blank')
                    
                raw_title = title_element.text.strip() if title_element else "N/A"
                title = clean_title(raw_title)
                
                a_tag = item.find('a', href=True)
                link = a_tag['href'] if a_tag else "N/A"

                company_element = item.find('a', class_=lambda c: c and 'company' in c.lower())
                company = company_element.text.strip() if company_element else "N/A"

                salary_element = item.find('label', class_=lambda c: c and 'salary' in c.lower())
                salary = salary_element.text.strip() if salary_element else "N/A"

                experience = "Không ghi rõ"
                exp_element = item.find('label', class_=lambda c: c and 'exp' in c.lower())
                if not exp_element:
                    labels = item.find_all('label')
                    for lbl in labels:
                        if 'năm' in lbl.text.lower() or 'kinh nghiệm' in lbl.text.lower() or 'tháng' in lbl.text.lower():
                            experience = lbl.text.strip()
                            break
                else:
                    experience = exp_element.text.strip()
                    
                location = "Không ghi rõ"
                loc_element = item.find('label', class_=lambda c: c and 'address' in c.lower())
                if loc_element:
                    location = loc_element.text.strip()

                city = extract_city(location)
                level = extract_level(title)
                language = extract_language(title)

                if title != "N/A" and title != "": 
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
            except Exception as e:
                continue
        
        page += 1
        
        if page > MAX_TEST_PAGES:
            print(f"\n-> Đã đạt giới hạn test {MAX_TEST_PAGES} trang. Đang tiến hành lưu dữ liệu...")
        else:
            time.sleep(3)

    driver.quit()
    
    df = pd.DataFrame(all_jobs_data)
    
    if not df.empty:
        print("\n==================================================")
        print(f"TỔNG KẾT: Đã thu thập thành công {len(df)} tin tuyển dụng!")
        print("==================================================")
        df.to_csv("test_topcv_jobs_paged.csv", index=False, encoding='utf-8-sig')
        print("Đã lưu dữ liệu vào file: test_topcv_jobs_paged.csv")
    else:
        print("\nKhông thu thập được dữ liệu nào.")

if __name__ == "__main__":
    crawl_test_5_pages()