CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    expected_salary INTEGER,      
    target_city VARCHAR(100),     
    current_level VARCHAR(100),   
    skills TEXT[],                
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    -- Lưu chuỗi gốc cào được (vd: "15 - 20 triệu") để hiển thị cho UI
    raw_salary VARCHAR(100), 
    -- Dữ liệu đã chuẩn hóa (số nguyên) để làm Filter và làm Matching
    min_salary BIGINT,      
    max_salary BIGINT,      
    city VARCHAR(100),
    experience VARCHAR(100),
    job_level VARCHAR(100), 
    -- Lưu mảng kỹ năng: vd '{"Java", "Python", "SQL"}' -> Cực kỳ dễ query thống kê 
    tech_stack TEXT[],       
    link TEXT UNIQUE NOT NULL,
    source VARCHAR(50),     
    -- Phục vụ thuật toán Trust Score (Job mới -> điểm cao) 
    trust_score INTEGER DEFAULT 100, 
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);