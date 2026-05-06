import os
from datetime import datetime, timedelta
from typing import List, Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "mining_cv_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "password")
DB_PORT = os.getenv("DB_PORT", "5432")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

app = FastAPI(title="Mining CV API", version="0.2.0")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT,
        cursor_factory=RealDictCursor,
    )


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    sub: Optional[str] = None


class UserCreate(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime


class ProfileIn(BaseModel):
    expected_salary: Optional[int] = None
    target_city: Optional[str] = None
    current_level: Optional[str] = None
    skills: Optional[List[str]] = []


class ProfileOut(ProfileIn):
    user_id: int
    updated_at: datetime


class JobOut(BaseModel):
    id: int
    title: str
    company: Optional[str]
    raw_salary: Optional[str]
    min_salary: Optional[int]
    max_salary: Optional[int]
    city: Optional[str]
    experience: Optional[str]
    job_level: Optional[str]
    tech_stack: Optional[List[str]]
    link: str
    source: Optional[str]
    trust_score: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class JobMatchOut(JobOut):
    match_rate: int


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    source: str = "local-ai-stub"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_user_by_email(email: str):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, email, password_hash, created_at FROM users WHERE email = %s", (email,))
                return cursor.fetchone()
    except Exception:
        return None


def get_user_by_id(user_id: int):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, email, created_at FROM users WHERE id = %s", (user_id,))
                return cursor.fetchone()
    except Exception:
        return None


def authenticate_user(email: str, password: str):
    user = get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(sub=email)
    except JWTError:
        raise credentials_exception
    user = get_user_by_email(token_data.sub)
    if user is None:
        raise credentials_exception
    return user


def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme)):
    if not token:
        return None
    try:
        return get_current_user(token)
    except HTTPException:
        return None


def get_user_profile(user_id: int):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT user_id, expected_salary, target_city, current_level, skills, updated_at FROM user_profiles WHERE user_id = %s",
                    (user_id,),
                )
                return cursor.fetchone()
    except Exception:
        return None


def calculate_match_rate(job: dict, profile: dict) -> int:
    job_skills = set([skill.lower() for skill in (job.get("tech_stack") or []) if isinstance(skill, str)])
    profile_skills = set([skill.lower() for skill in (profile.get("skills") or []) if isinstance(skill, str)])
    skill_match = 0
    if job_skills:
        skill_match = len(job_skills & profile_skills) / len(job_skills)
    skill_score = skill_match * 50

    level_score = 0
    job_level = (job.get("job_level") or "").lower()
    current_level = (profile.get("current_level") or "").lower()
    if job_level and current_level:
        if current_level == job_level:
            level_score = 20
        elif current_level in ["senior", "lead", "manager"] and job_level in ["junior", "middle"]:
            level_score = 15
        elif current_level in ["junior", "fresher", "intern"] and job_level in ["middle", "senior", "lead", "manager"]:
            level_score = 10

    salary_score = 0
    expected_salary = profile.get("expected_salary")
    min_salary = job.get("min_salary")
    max_salary = job.get("max_salary")
    if expected_salary and min_salary is not None and max_salary is not None:
        if min_salary <= expected_salary <= max_salary:
            salary_score = 15
        elif expected_salary <= max_salary * 1.1:
            salary_score = 8
    elif expected_salary and min_salary is not None:
        salary_score = 5

    city_score = 0
    target_city = (profile.get("target_city") or "").lower()
    job_city = (job.get("city") or "").lower()
    if target_city and job_city and target_city == job_city:
        city_score = 10

    trust_bonus = min(max((job.get("trust_score") or 0) / 100 * 5, 0), 5)

    total = int(round(skill_score + level_score + salary_score + city_score + trust_bonus))
    return min(total, 100)


def compute_trust_score(job: dict) -> int:
    trust = job.get("trust_score") or 50
    created_at = job.get("created_at")
    if isinstance(created_at, datetime):
        age_days = (datetime.utcnow() - created_at).days
        if age_days <= 7:
            trust += 10
        elif age_days > 30:
            trust -= 10
    return max(0, min(100, trust))


def stub_ai_advice(prompt: str, profile: Optional[dict] = None) -> str:
    prompt_lower = prompt.lower()
    if "skill" in prompt_lower or "language" in prompt_lower:
        return "Bạn có thể tập trung vào kỹ năng đã được hỏi nhiều trên thị trường: Python, SQL, Docker và DevOps. Nếu bạn có kinh nghiệm backend thì hãy làm nổi bật các dự án thực tế."
    if "job" in prompt_lower or "nghề" in prompt_lower or "career" in prompt_lower:
        return "Hãy chọn công việc phù hợp với level hiện tại và lộ trình kỹ năng. Mục tiêu 6-12 tháng nên tập trung vào một stack cụ thể và mở rộng network."
    if profile and profile.get("target_city"):
        return f"Với mục tiêu làm ở {profile.get('target_city')}, bạn nên xem các công việc yêu cầu kỹ năng {', '.join(profile.get('skills') or [])} và theo dõi doanh nghiệp tuyển dụng thường xuyên."
    return "Tôi đã nhận được câu hỏi của bạn. Hãy nhập rõ hơn về mục tiêu nghề nghiệp hoặc kỹ năng hiện có để tôi tư vấn cụ thể hơn."


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/auth/register", response_model=UserOut)
def register_user(user: UserCreate):
    existing = get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    hashed_password = get_password_hash(user.password)
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id, email, created_at",
                    (user.email, hashed_password),
                )
                conn.commit()
                row = cursor.fetchone()
                return row
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/auth/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai email hoặc mật khẩu",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserOut)
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "email": current_user["email"], "created_at": current_user["created_at"]}


@app.get("/profiles/me", response_model=ProfileOut)
def read_profile(current_user: dict = Depends(get_current_user)):
    profile = get_user_profile(current_user["id"])
    if not profile:
        return {"user_id": current_user["id"], "expected_salary": None, "target_city": None, "current_level": None, "skills": [], "updated_at": datetime.utcnow()}
    return profile


@app.put("/profiles/me", response_model=ProfileOut)
def update_profile(profile_in: ProfileIn, current_user: dict = Depends(get_current_user)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO user_profiles (user_id, expected_salary, target_city, current_level, skills, updated_at) VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP) "
                    "ON CONFLICT (user_id) DO UPDATE SET expected_salary = EXCLUDED.expected_salary, target_city = EXCLUDED.target_city, current_level = EXCLUDED.current_level, skills = EXCLUDED.skills, updated_at = CURRENT_TIMESTAMP RETURNING user_id, expected_salary, target_city, current_level, skills, updated_at",
                    (current_user["id"], profile_in.expected_salary, profile_in.target_city, profile_in.current_level, profile_in.skills),
                )
                conn.commit()
                return cursor.fetchone()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/jobs/filters")
def get_filters():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT DISTINCT city FROM jobs WHERE city IS NOT NULL ORDER BY city")
                cities = [row["city"] for row in cursor.fetchall() if row["city"]]

                cursor.execute("SELECT DISTINCT source FROM jobs WHERE source IS NOT NULL ORDER BY source")
                sources = [row["source"] for row in cursor.fetchall() if row["source"]]

                cursor.execute("SELECT DISTINCT job_level FROM jobs WHERE job_level IS NOT NULL ORDER BY job_level")
                levels = [row["job_level"] for row in cursor.fetchall() if row["job_level"]]

                cursor.execute("SELECT DISTINCT experience FROM jobs WHERE experience IS NOT NULL ORDER BY experience")
                experiences = [row["experience"] for row in cursor.fetchall() if row["experience"]]

                cursor.execute("SELECT DISTINCT LOWER(unnest(tech_stack)) AS tech FROM jobs WHERE tech_stack IS NOT NULL ORDER BY tech")
                techs = [row["tech"] for row in cursor.fetchall() if row["tech"]]

                return {
                    "cities": cities,
                    "sources": sources,
                    "job_levels": levels,
                    "experiences": experiences,
                    "techs": techs,
                }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/jobs/recommendations", response_model=List[JobMatchOut])
def recommendations(
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    profile = get_user_profile(current_user["id"])
    if not profile:
        raise HTTPException(status_code=400, detail="Vui lòng cập nhật profile trước")

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM jobs WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 200")
                jobs = cursor.fetchall()
                scored = []
                for job in jobs:
                    match_rate = calculate_match_rate(job, profile)
                    job_data = dict(job)
                    job_data["match_rate"] = match_rate
                    scored.append(job_data)
                scored.sort(key=lambda x: x["match_rate"], reverse=True)
                return scored[:limit]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/jobs/{job_id}/score")
def score_job(job_id: int, current_user: dict = Depends(get_current_user)):
    profile = get_user_profile(current_user["id"])
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
                job = cursor.fetchone()
                if not job:
                    raise HTTPException(status_code=404, detail="Job not found")
                trust = compute_trust_score(job)
                match_rate = calculate_match_rate(job, profile) if profile else 0
                return {"job_id": job_id, "match_rate": match_rate, "trust_score": trust, "job": job}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/stats/tech-trends")
def tech_trends(months: int = Query(6, ge=1, le=24)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT to_char(created_at, 'YYYY-MM') AS month, LOWER(tech) AS tech, COUNT(*) AS count "
                    "FROM jobs, unnest(tech_stack) AS tech "
                    "WHERE created_at >= CURRENT_DATE - (%s || ' months')::interval "
                    "GROUP BY month, tech "
                    "ORDER BY month DESC, count DESC",
                    (months,),
                )
                return cursor.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/chatbot/message", response_model=ChatResponse)
def chatbot_message(request: ChatRequest, current_user: Optional[dict] = Depends(get_current_user_optional)):
    profile = None
    if current_user:
        profile = get_user_profile(current_user["id"])
    answer = stub_ai_advice(request.message, profile)
    return {"answer": answer, "source": "gemini-future-stub"}


@app.get("/stats/cities")
def stats_cities():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT city, COUNT(*) AS job_count FROM jobs WHERE is_active = TRUE GROUP BY city ORDER BY job_count DESC LIMIT 50"
                )
                return cursor.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
