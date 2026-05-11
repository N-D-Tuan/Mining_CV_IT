import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "mining_jobs_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")

def insert_sample_fb_groups():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

    try:
        with conn.cursor() as cursor:
            # Insert sample groups
            groups = [
                ("Việc làm part time cho Sinh viên tại Đà Nẵng", "https://www.facebook.com/groups/1574002216182702", 5),
<<<<<<< Tuan_Crawler_JobFB
                # ("Facebook Group Part-time", "https://www.facebook.com/groups/359677107104158/", 5),
=======
>>>>>>> main
                # Thêm các nhóm khác ở đây
                # ("Tên nhóm khác", "https://www.facebook.com/groups/...", 5),
            ]

            for name, url, max_posts in groups:
                cursor.execute("""
                    INSERT INTO fb_groups (name, url, max_posts_per_crawl)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (url) DO NOTHING
                """, (name, url, max_posts))

            conn.commit()
            print(f"[✓] Đã thêm {len(groups)} nhóm mẫu vào database")

    finally:
        conn.close()

if __name__ == "__main__":
    insert_sample_fb_groups()