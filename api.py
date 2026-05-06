import os
from datetime import datetime
from typing import List, Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "mining_cv_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "password")
DB_PORT = os.getenv("DB_PORT", "5432")

app = FastAPI(title="Mining CV API", version="0.1.0")


def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT,
        cursor_factory=RealDictCursor,
    )


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


@app.get("/health")
def health_check():
    return {"status": "ok"}


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
):
    conditions = ["is_active = TRUE"]
    params = []

    if city:
        conditions.append("LOWER(city) = LOWER(%s)")
        params.append(city)
    if source:
        conditions.append("LOWER(source) = LOWER(%s)")
        params.append(source)
    if job_level:
        conditions.append("LOWER(job_level) = LOWER(%s)")
        params.append(job_level)
    if experience:
        conditions.append("LOWER(experience) = LOWER(%s)")
        params.append(experience)
    if tech:
        conditions.append("%s = ANY(tech_stack)")
        params.append(tech)
    if keyword:
        keyword_pattern = f"%{keyword}%"
        conditions.append("(LOWER(title) LIKE LOWER(%s) OR LOWER(company) LIKE LOWER(%s))")
        params.extend([keyword_pattern, keyword_pattern])
    if min_salary is not None:
        conditions.append("COALESCE(max_salary, min_salary, 0) >= %s")
        params.append(min_salary)
    if max_salary is not None:
        conditions.append("COALESCE(min_salary, max_salary, 0) <= %s")
        params.append(max_salary)

    where_clause = " AND ".join(conditions)
    query = f"SELECT * FROM jobs WHERE {where_clause} ORDER BY created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                rows = cursor.fetchall()
                return rows
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: int):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
                row = cursor.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Job not found")
                return row
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


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
