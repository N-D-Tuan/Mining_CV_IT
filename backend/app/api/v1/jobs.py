from typing import Optional
from sqlalchemy import func

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.job import Job
from schemas.common import ApiResponse
from schemas.job import GetJobsQuery, GetJobMapQuery, JobDetailResponse, JobResponse

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

    # compute total matching rows (ignore cursor/limit)
    count_stmt = select(func.count()).select_from(Job)
    # apply same filters as above, but do NOT apply cursor or limit
    if query.title:
        count_stmt = count_stmt.where(Job.title.ilike(f"%{query.title}%"))
    if query.employer_name:
        count_stmt = count_stmt.where(Job.employer_name.ilike(f"%{query.employer_name}%"))
    if query.job_type:
        count_stmt = count_stmt.where(Job.job_type == query.job_type)
    if query.min_salary is not None:
        count_stmt = count_stmt.where(Job.min_salary >= query.min_salary)
    if query.max_salary is not None:
        count_stmt = count_stmt.where(Job.max_salary <= query.max_salary)
    if query.created_from:
        count_stmt = count_stmt.where(Job.created_at >= query.created_from)
    if query.created_to:
        count_stmt = count_stmt.where(Job.created_at <= query.created_to)

    total = await db.scalar(count_stmt)

    return ApiResponse(
        data={
            "items": [JobResponse.model_validate(j) for j in items],
            "next_cursor": items[-1].id if has_next else None,
            "has_next": has_next,
            "total": int(total or 0),
        }
    )


# ─── THÊM MỚI: GET /jobs/map (TÌM CÔNG VIỆC XUNG QUANH BÁN KÍNH) ────────────────

@router.get("/map")
async def get_jobs_on_map(
    query: GetJobMapQuery = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Tìm kiếm các công việc quanh vị trí người dùng dựa vào công thức Haversine toán học.
    Bán kính mặc định được cấu hình trong schema là 5.0 km.
    """
    # Bán kính Trái Đất ước tính khoảng 6371 km
    earth_radius = 6371.0

    # Chuyển đổi tọa độ từ độ (degree) sang radian trực tiếp trong câu SQL qua func.radians
    user_lat_rad = func.radians(query.lat)
    user_lng_rad = func.radians(query.lng)
    job_lat_rad = func.radians(Job.lat)
    job_lng_rad = func.radians(Job.lng)

    # Biểu thức tính công thức Haversine
    haversine_formula = (
    2 * earth_radius * func.asin(
        func.sqrt(
            func.pow(
                func.sin((job_lat_rad - user_lat_rad) / 2),
                2
            ) +
            func.cos(user_lat_rad) *
            func.cos(job_lat_rad) *
            func.pow(
                func.sin((job_lng_rad - user_lng_rad) / 2),
                2
            )
        )
    )
)

    # Tạo câu lệnh SQL, chỉ lấy các bản ghi có đầy đủ lat và lng
    stmt = select(Job).where(Job.lat.isnot(None), Job.lng.isnot(None))

    # Áp dụng bộ lọc khoảng cách địa lý (khoảng cách <= bán kính người dùng chọn)
    stmt = stmt.where(haversine_formula <= query.radius)

    # Kế thừa hoàn chỉnh các bộ lọc từ JobFilterQuery cũ để tối ưu tìm kiếm kết hợp
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

    # Sắp xếp các công việc gần vị trí người dùng nhất lên đầu
    stmt = stmt.order_by(haversine_formula.asc())

    # Vì hiển thị trên Map cần gom cụm dữ liệu gọn gàng, chúng ta giới hạn lấy tối đa 100 Marker cùng lúc
    stmt = stmt.limit(100)

    jobs = list(await db.scalars(stmt))

    return ApiResponse(
        data={
            "items": [JobResponse.model_validate(j) for j in jobs],
            "total": len(jobs)
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