CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255),          -- Tên người dùng (Có thể là tên thật hoặc nickname)
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),          -- Tên người dùng (Có thể là tên thật hoặc nickname)
    expected_salary INTEGER,      -- Mức lương mong muốn (Có thể là theo giờ hoặc theo tháng)
    city VARCHAR(100),            -- Thành phố hiện đang sinh sống 
    experience TEXT,              -- Kinh nghiệm (VD: "Đã làm phục vụ 6 tháng", "Chưa có kinh nghiệm")
    favorite_jobs TEXT[],         -- Công việc yêu thích (VD: '{"Phục vụ", "Pha chế", "Gia sư"}')
    skills TEXT[],                -- Kỹ năng mềm (VD: '{"Tiếng Anh", "Giao tiếp", "Nhanh nhẹn"}')
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    -- Thông tin cơ bản
    title VARCHAR(500),           -- Tiêu đề (Sẽ cố gắng tách ra từ dòng đầu của post FB, có thể null)
    employer_name VARCHAR(255),   -- Tên quán/Người tuyển dụng (Thay cho Company)
    
    -- Lương thưởng
    raw_salary TEXT,      -- Lương gốc (VD: "22k-25k/h", "3tr/tháng + bao ăn")
    min_salary BIGINT,            -- Chuẩn hóa số (VD: 22000)
    max_salary BIGINT,            -- Chuẩn hóa số (VD: 25000)
    salary_type VARCHAR(50),      -- Loại lương: 'hourly' (theo giờ), 'daily' (theo ngày), 'monthly' (theo tháng)
    
    -- Địa điểm (Rất quan trọng với sinh viên)
    city VARCHAR(100),            -- Thành phố (Hà Nội, HCM...) 
    address TEXT,                 -- Địa chỉ cụ thể của quán
    
    -- Tính chất công việc
    job_type VARCHAR(100),        -- Loại hình (Part-time, Full-time, Ca gãy, Ca xoay)
    experience_required VARCHAR(255), -- Yêu cầu kinh nghiệm
    requirements TEXT[],          -- Yêu cầu khác lưu dạng mảng (VD: '{"Có xe máy", "Nữ"}')
    
    -- Nguồn dữ liệu Facebook
    post_content TEXT,            -- **QUAN TRỌNG:** Lưu TẤT CẢ nội dung bài viết gốc của FB để làm Tìm kiếm (Full-text search)
    link TEXT UNIQUE NOT NULL,    -- Link bài post FB (Chống trùng)
    source VARCHAR(255),          -- Nguồn (Tên Group FB. VD: "Việc làm sinh viên Hà Nội")

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_jobs (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);

-- Bảng quản lý các nhóm Facebook để crawl
CREATE TABLE IF NOT EXISTS fb_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,                    -- Tên nhóm (VD: "Facebook Group Part-time")
    url TEXT NOT NULL UNIQUE,                      -- URL của nhóm
    status VARCHAR(50) DEFAULT 'active',           -- Trạng thái: 'active', 'inactive', 'paused'
    crawl_count_today INTEGER DEFAULT 0,           -- Số lần đã crawl trong ngày hôm nay
    last_crawl TIMESTAMP WITH TIME ZONE,           -- Thời gian crawl lần cuối
    max_posts_per_crawl INTEGER DEFAULT 5,         -- Số bài tối đa crawl mỗi lần
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applied_jobs (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);