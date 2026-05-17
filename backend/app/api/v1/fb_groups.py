from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.fb_group import FBGroup
from schemas.common import ApiResponse
from schemas.fb_group import CreateFBGroupRequest, FBGroupResponse, UpdateFBGroupRequest

router = APIRouter()


# ─── POST /fb-groups ──────────────────────────────────────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_fb_group(
    payload: CreateFBGroupRequest,
    db: AsyncSession = Depends(get_db),
):
    url_str = str(payload.url)
    existing = await db.scalar(select(FBGroup).where(FBGroup.url == url_str))
    if existing:
        raise HTTPException(status_code=400, detail="URL này đã tồn tại")

    group = FBGroup(
        name=payload.name,
        url=url_str,
        max_posts_per_crawl=payload.max_posts_per_crawl,
    )
    db.add(group)
    await db.commit()
    await db.refresh(group)

    return ApiResponse(
        message="Tạo FB group thành công",
        data=FBGroupResponse.model_validate(group),
    )


# ─── GET /fb-groups ───────────────────────────────────────────────────────────

@router.get("")
async def get_fb_groups(
    db: AsyncSession = Depends(get_db),
):
    groups = list(await db.scalars(select(FBGroup).order_by(FBGroup.id.desc())))
    return ApiResponse(data=[FBGroupResponse.model_validate(g) for g in groups])


# ─── GET /fb-groups/{id} ──────────────────────────────────────────────────────

@router.get("/{group_id}")
async def get_fb_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
):
    group = await db.scalar(select(FBGroup).where(FBGroup.id == group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Không tìm thấy group")
    return ApiResponse(data=FBGroupResponse.model_validate(group))


# ─── PUT /fb-groups/{id} ──────────────────────────────────────────────────────

@router.put("/{group_id}")
async def update_fb_group(
    group_id: int,
    payload: UpdateFBGroupRequest,
    db: AsyncSession = Depends(get_db),
):
    group = await db.scalar(select(FBGroup).where(FBGroup.id == group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Không tìm thấy group")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(group, field, value)

    await db.commit()
    await db.refresh(group)

    return ApiResponse(
        message="Cập nhật thành công",
        data=FBGroupResponse.model_validate(group),
    )


# ─── DELETE /fb-groups/{id} ───────────────────────────────────────────────────

@router.delete("/{group_id}", status_code=status.HTTP_200_OK)
async def delete_fb_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
):
    group = await db.scalar(select(FBGroup).where(FBGroup.id == group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Không tìm thấy group")

    await db.delete(group)
    await db.commit()

    return ApiResponse(message="Xóa thành công")