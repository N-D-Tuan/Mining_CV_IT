from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from core.timezone import to_vn_time
 
from api.deps import get_current_user
from core.database import get_db
from models.user import User
from models.association import SavedJob, AppliedJob
from models.job import Job
from schemas.common import ApiResponse
from schemas.user import UserProfileResponse
from schemas.job import JobResponse, SavedJobsResponse

from schemas.user import UserProfileResponse
 
router = APIRouter()

class UpdateProfileRequest(BaseModel):
    expected_salary: Optional[int] = None
    city: Optional[str] = None
    experience: Optional[str] = None
    favorite_jobs: Optional[List[str]] = None
    skills: Optional[List[str]] = None

@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Lazy load profile nếu có bảng user_profiles riêng
    # Hiện tại User chưa có relationship tới user_profiles,
    # nên query thẳng
    from models.user_profile import UserProfile  # import tại đây tránh circular
 
    profile = await db.scalar(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
 
    data = {
        "has_profile": profile is not None,
        "user_name": current_user.user_name,
        "user_id": current_user.id,
        "email": current_user.email,
        "created_at": to_vn_time(current_user.created_at),
        "expected_salary": profile.expected_salary if profile else None,
        "city": profile.city if profile else None,
        "experience": profile.experience if profile else None,
        "favorite_jobs": profile.favorite_jobs if profile else None,
        "skills": profile.skills if profile else None,
        "updated_at": to_vn_time(profile.updated_at) if profile else to_vn_time(current_user.created_at),
    }
 
    return ApiResponse(data=data)

@router.post("/profile", status_code=201)
async def create_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from models.user_profile import UserProfile
 
    existing = await db.scalar(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    if existing:
        raise HTTPException(status_code=400, detail="Profile đã tồn tại, dùng PUT để cập nhật")
 
    profile = UserProfile(
        user_id=current_user.id,
        **payload.model_dump(exclude_none=True),
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
 
    return ApiResponse(
        message="Tạo profile thành công", 
        data=UserProfileResponse.model_validate(profile)
    )

@router.put("/profile")
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from models.user_profile import UserProfile
 
    profile = await db.scalar(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile chưa tồn tại, dùng POST để tạo")
 
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
 
    await db.commit()
    await db.refresh(profile)
 
    return ApiResponse(
        message="Cập nhật profile thành công", 
        data=UserProfileResponse.model_validate(profile)
    )

@router.get("/saved-jobs")
async def get_saved_jobs(
    cursor: Optional[int] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Job)
        .join(SavedJob, SavedJob.job_id == Job.id)
        .where(SavedJob.user_id == current_user.id)
        .order_by(Job.id.desc())
        .limit(limit + 1)
    )
    if cursor:
        stmt = stmt.where(Job.id < cursor)
 
    jobs = list(await db.scalars(stmt))
    has_next = len(jobs) > limit
    items = jobs[:limit]
 
    return ApiResponse(
        data={
            "items": [JobResponse.model_validate(j) for j in items],
            "next_cursor": items[-1].id if has_next else None,
            "has_next": has_next,
        }
    )

@router.post("/saved-jobs/{job_id}", status_code=status.HTTP_201_CREATED)
async def save_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    job = await db.scalar(select(Job).where(Job.id == job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy job")
 
    existing = await db.scalar(
        select(SavedJob).where(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id,
        )
    )
    if existing:
        raise HTTPException(status_code=400, detail="Job này đã được lưu trước đó")
 
    db.add(SavedJob(user_id=current_user.id, job_id=job_id))
    await db.commit()
 
    return ApiResponse(message="Lưu job thành công")

@router.delete("/saved-jobs/{job_id}")
async def unsave_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    saved = await db.scalar(
        select(SavedJob).where(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id,
        )
    )
    if not saved:
        raise HTTPException(status_code=404, detail="Job này chưa được lưu")
 
    await db.delete(saved)
    await db.commit()
 
    return ApiResponse(message="Đã xóa job khỏi danh sách đã lưu")

@router.get("/saved-jobs/{job_id}")
async def get_saved_job_status(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    saved = await db.scalar(
        select(SavedJob).where(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id,
        )
    )
    return ApiResponse(data={"saved": bool(saved)})

@router.get("/applied-jobs")
async def get_applied_jobs(
    cursor: Optional[int] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Job)
        .join(AppliedJob, AppliedJob.job_id == Job.id)
        .where(AppliedJob.user_id == current_user.id)
        .order_by(Job.id.desc())
        .limit(limit + 1)
    )
    if cursor:
        stmt = stmt.where(Job.id < cursor)
 
    jobs = list(await db.scalars(stmt))
    has_next = len(jobs) > limit
    items = jobs[:limit]
 
    return ApiResponse(
        data={
            "items": [JobResponse.model_validate(j) for j in items],
            "next_cursor": items[-1].id if has_next else None,
            "has_next": has_next,
        }
    )

@router.post("/applied-jobs/{job_id}", status_code=status.HTTP_201_CREATED)
async def apply_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    job = await db.scalar(select(Job).where(Job.id == job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy job")
 
    existing = await db.scalar(
        select(AppliedJob).where(
            AppliedJob.user_id == current_user.id,
            AppliedJob.job_id == job_id,
        )
    )
    if existing:
        raise HTTPException(status_code=400, detail="Bạn đã ứng tuyển job này rồi")
 
    db.add(AppliedJob(user_id=current_user.id, job_id=job_id))
    await db.commit()
 
    return ApiResponse(message="Ứng tuyển thành công")

@router.get("/applied-jobs/{job_id}")
async def get_applied_job_status(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    applied = await db.scalar(
        select(AppliedJob).where(
            AppliedJob.user_id == current_user.id,
            AppliedJob.job_id == job_id,
        )
    )
    return ApiResponse(data={"applied": bool(applied)})

@router.delete("/applied-jobs/{job_id}")
async def unapply_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    applied = await db.scalar(
        select(AppliedJob).where(
            AppliedJob.user_id == current_user.id,
            AppliedJob.job_id == job_id,
        )
    )
    if not applied:
        raise HTTPException(status_code=404, detail="Bạn chưa ứng tuyển job này")
 
    await db.delete(applied)
    await db.commit()
 
    return ApiResponse(message="Đã hủy ứng tuyển")