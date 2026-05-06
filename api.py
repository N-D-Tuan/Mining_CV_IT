import os
from datetime import datetime, timedelta
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, validator
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine, desc, func
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "mining_cv_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "password")
DB_PORT = os.getenv("DB_PORT", "5432")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(Integer, primary_key=True)
    expected_salary = Column(Integer)
    target_city = Column(String(100))
    current_level = Column(String(100))
    skills = Column(PG_ARRAY(String))
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255))
    raw_salary = Column(String(100))
    min_salary = Column(Integer)
    max_salary = Column(Integer)
    city = Column(String(100))
    experience = Column(String(100))
    job_level = Column(String(100))
    tech_stack = Column(PG_ARRAY(String))
    link = Column(Text, unique=True, nullable=False)
    source = Column(String(50))
    trust_score = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mining CV API", version="0.2.0")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], default="pbkdf2_sha256", deprecated="auto")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    sub: Optional[str] = None


class UserCreate(BaseModel):
    email: str
    password: str

    @validator("password")
    def password_length(cls, value: str):
        if len(value) < 8:
            raise ValueError("Mật khẩu phải có ít nhất 8 ký tự")
        if len(value) > 150:
            raise ValueError("Mật khẩu không được dài hơn 150 ký tự")
        return value


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        orm_mode = True


class ProfileIn(BaseModel):
    expected_salary: Optional[int] = None
    target_city: Optional[str] = None
    current_level: Optional[str] = None
    skills: Optional[List[str]] = None


class ProfileOut(ProfileIn):
    user_id: int
    updated_at: datetime

    class Config:
        orm_mode = True


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

    class Config:
        orm_mode = True


class JobMatchOut(JobOut):
    match_rate: int


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    source: str = "local-ai-stub"


class JobFilterResponse(BaseModel):
    cities: List[str]
    sources: List[str]
    job_levels: List[str]
    experiences: List[str]
    techs: List[str]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    user = get_user_by_email(db, token_data.sub)
    if user is None:
        raise credentials_exception
    return user


def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        return get_current_user(token, db)
    except HTTPException:
        return None


def get_user_profile(db: Session, user_id: int):
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()


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
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")
    hashed_password = get_password_hash(user.password)
    try:
        db_user = User(email=user.email, password_hash=hashed_password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/auth/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai email hoặc mật khẩu",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/profiles/me", response_model=ProfileOut)
def read_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_user_profile(db, current_user.id)
    if not profile:
        return ProfileOut(user_id=current_user.id, expected_salary=None, target_city=None, current_level=None, skills=[], updated_at=datetime.utcnow())
    return profile


@app.put("/profiles/me", response_model=ProfileOut)
def update_profile(profile_in: ProfileIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_user_profile(db, current_user.id)
    try:
        if profile:
            profile.expected_salary = profile_in.expected_salary
            profile.target_city = profile_in.target_city
            profile.current_level = profile_in.current_level
            profile.skills = profile_in.skills or []
            profile.updated_at = datetime.utcnow()
        else:
            profile = UserProfile(
                user_id=current_user.id,
                expected_salary=profile_in.expected_salary,
                target_city=profile_in.target_city,
                current_level=profile_in.current_level,
                skills=profile_in.skills or [],
            )
            db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/jobs", response_model=List[JobOut])
def list_jobs(
    city: Optional[str] = Query(None, description="Lọc theo thành phố"),
    source: Optional[str] = Query(None, description="Nguồn dữ liệu"),
    job_level: Optional[str] = Query(None, description="Trình độ"),
    experience: Optional[str] = Query(None, description="Kinh nghiệm"),
    tech: Optional[str] = Query(None, description="Kỹ năng / công nghệ"),
    keyword: Optional[str] = Query(None, description="Tìm kiếm title hoặc company"),
    min_salary: Optional[int] = Query(None, description="Lọc lương tối thiểu (VND)"),
    max_salary: Optional[int] = Query(None, description="Lọc lương tối đa (VND)"),
    limit: int = Query(50, ge=1, le=200, description="Số bản ghi trả về"),
    offset: int = Query(0, ge=0, description="Offset"),
    db: Session = Depends(get_db),
):
    query = db.query(Job).filter(Job.is_active == True)
    if city:
        query = query.filter(func.lower(Job.city) == city.lower())
    if source:
        query = query.filter(func.lower(Job.source) == source.lower())
    if job_level:
        query = query.filter(func.lower(Job.job_level) == job_level.lower())
    if experience:
        query = query.filter(func.lower(Job.experience) == experience.lower())
    if tech:
        query = query.filter(Job.tech_stack.any(tech))
    if keyword:
        keyword_pattern = f"%{keyword}%"
        query = query.filter(func.lower(Job.title).like(keyword_pattern.lower()) | func.lower(Job.company).like(keyword_pattern.lower()))
    if min_salary is not None:
        query = query.filter(func.coalesce(Job.max_salary, Job.min_salary, 0) >= min_salary)
    if max_salary is not None:
        query = query.filter(func.coalesce(Job.min_salary, Job.max_salary, 0) <= max_salary)
    jobs = query.order_by(desc(Job.created_at)).limit(limit).offset(offset).all()
    return jobs


@app.get("/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/jobs/filters", response_model=JobFilterResponse)
def get_filters(db: Session = Depends(get_db)):
    cities = [row[0] for row in db.query(Job.city).filter(Job.city.isnot(None)).distinct().order_by(Job.city).all() if row[0]]
    sources = [row[0] for row in db.query(Job.source).filter(Job.source.isnot(None)).distinct().order_by(Job.source).all() if row[0]]
    levels = [row[0] for row in db.query(Job.job_level).filter(Job.job_level.isnot(None)).distinct().order_by(Job.job_level).all() if row[0]]
    experiences = [row[0] for row in db.query(Job.experience).filter(Job.experience.isnot(None)).distinct().order_by(Job.experience).all() if row[0]]
    tech_expr = func.lower(func.unnest(Job.tech_stack)).label("tech")
    techs = [row.tech for row in db.query(tech_expr).filter(Job.tech_stack.isnot(None)).distinct().order_by(tech_expr).all() if row.tech]
    return {
        "cities": cities,
        "sources": sources,
        "job_levels": levels,
        "experiences": experiences,
        "techs": techs,
    }


@app.get("/jobs/recommendations", response_model=List[JobMatchOut])
def recommendations(
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_user_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Vui lòng cập nhật profile trước")
    jobs = db.query(Job).filter(Job.is_active == True).order_by(desc(Job.created_at)).limit(200).all()
    scored = []
    for job in jobs:
        job_data = {k: v for k, v in job.__dict__.items() if k != "_sa_instance_state"}
        match_rate = calculate_match_rate(job_data, profile.__dict__)
        job_data["match_rate"] = match_rate
        scored.append(job_data)
    scored.sort(key=lambda x: x["match_rate"], reverse=True)
    return [JobMatchOut(**job) for job in scored[:limit]]


@app.get("/jobs/{job_id}/score")
def score_job(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_user_profile(db, current_user.id)
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job_data = {k: v for k, v in job.__dict__.items() if k != "_sa_instance_state"}
    trust = compute_trust_score(job_data)
    match_rate = calculate_match_rate(job_data, profile.__dict__) if profile else 0
    return {"job_id": job_id, "match_rate": match_rate, "trust_score": trust, "job": job_data}


@app.get("/stats/tech-trends")
def tech_trends(months: int = Query(6, ge=1, le=24), db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=months * 30)
    tech_rows = db.query(
        func.to_char(Job.created_at, "YYYY-MM").label("month"),
        func.lower(func.unnest(Job.tech_stack)).label("tech"),
        func.count().label("count"),
    ).filter(Job.created_at >= cutoff).group_by("month", "tech").order_by(desc("month"), desc("count")).all()
    return [{"month": row.month, "tech": row.tech, "count": row.count} for row in tech_rows]


@app.post("/chatbot/message", response_model=ChatResponse)
def chatbot_message(request: ChatRequest, current_user: Optional[User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    profile = None
    if current_user:
        profile = get_user_profile(db, current_user.id)
    answer = stub_ai_advice(request.message, profile.__dict__ if profile else None)
    return {"answer": answer, "source": "gemini-future-stub"}


@app.get("/stats/cities")
def stats_cities(db: Session = Depends(get_db)):
    cities = db.query(Job.city, func.count().label("job_count")).filter(Job.is_active == True).group_by(Job.city).order_by(desc("job_count")).limit(50).all()
    return [{"city": row.city, "job_count": row.job_count} for row in cities]
