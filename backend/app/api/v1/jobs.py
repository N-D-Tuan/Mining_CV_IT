from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.job import Job
from schemas.common import ApiResponse
from schemas.job import GetJobsQuery, JobDetailResponse, JobResponse

router = APIRouter()


# ─── GET /jobs ────────────────────────────────────────────────────────────────

@router.get("")
async def get_jobs(
    query: GetJobsQuery = Depends(),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Job).order_by(Job.id.desc()).limit(query.limit + 1)

    # cursor pagination
    if query.cursor:
        stmt = stmt.where(Job.id < query.cursor)

    # filters
    if query.title:
        stmt = stmt.where(Job.title.ilike(f"%{query.title}%"))
    if query.employer_name:
        stmt = stmt.where(Job.employer_name.ilike(f"%{query.employer_name}%"))
    if query.job_type:
        stmt = stmt.where(Job.job_type == query.job_type)
    if query.min_salary is not None:
        stmt = stmt.where(Job.min_salary >= query.min_salary)
    if query.max_salary is not None:
        stmt = stmt.where(Job.max_salary <= query.max_salary)
    if query.created_from:
        stmt = stmt.where(Job.created_at >= query.created_from)
    if query.created_to:
        stmt = stmt.where(Job.created_at <= query.created_to)

    jobs = list(await db.scalars(stmt))
    has_next = len(jobs) > query.limit
    items = jobs[:query.limit]

    return ApiResponse(
        data={
            "items": [JobResponse.model_validate(j) for j in items],
            "next_cursor": items[-1].id if has_next else None,
            "has_next": has_next,
        }
    )


# ─── GET /jobs/{job_id} ───────────────────────────────────────────────────────

@router.get("/{job_id}")
async def get_job_detail(
    job_id: int,
    db: AsyncSession = Depends(get_db),
):
    job = await db.scalar(select(Job).where(Job.id == job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy job")

    return ApiResponse(data=JobDetailResponse.model_validate(job))