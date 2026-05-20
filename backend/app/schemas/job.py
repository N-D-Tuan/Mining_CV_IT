from datetime import datetime
from typing import List, Optional
from schemas.pagination import CursorPagination

from pydantic import BaseModel, Field


class JobResponse(BaseModel):
    id: int

    title: Optional[str]

    employer_name: Optional[str]

    raw_salary: Optional[str]

    min_salary: Optional[int]

    max_salary: Optional[int]

    salary_type: Optional[str]

    city: Optional[str]

    address: Optional[str]

    job_type: Optional[str]

    experience_required: Optional[str]

    requirements: Optional[List[str]]

    source: Optional[str]

    # THÊM MỚI: TOẠ ĐỘ ĐỂ FRONTEND DRAW MARKER TRÊN MAP
    lat: Optional[float] = Field(default=None, description="Vĩ độ")
    lng: Optional[float] = Field(default=None, description="Kinh độ")

    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class JobDetailResponse(JobResponse):

    post_content: Optional[str]

    link: str

    updated_at: datetime

class JobPaginationQuery(BaseModel):
    cursor: Optional[int] = None

    limit: int = Field(default=20, ge=1, le=100)

class JobFilterQuery(BaseModel):

    title: Optional[str] = Field(default=None, max_length=255)

    employer_name: Optional[str] = Field(
        default=None,
        max_length=255
    )

    min_salary: Optional[int] = Field(
        default=None,
        ge=0
    )

    max_salary: Optional[int] = Field(
        default=None,
        ge=0
    )

    job_type: Optional[str] = Field(
        default=None,
        max_length=100
    )

    created_from: Optional[datetime] = None

    created_to: Optional[datetime] = None

class GetJobsQuery(JobPaginationQuery, JobFilterQuery):
    pass

class SavedJobsResponse(
    CursorPagination[JobResponse]
):
    pass


# Thêm mới cho endpoint GET MAP JOBS
class GetJobMapQuery(JobFilterQuery):
    """
    Sử dụng khi User bật định vị trên bản đồ.
    Kế thừa JobFilterQuery để vừa tìm theo vị trí vừa lọc được lương/loại công việc.
    """
    lat: float = Field(..., ge=-90, le=90, description="Vĩ độ hiện tại của người dùng")
    lng: float = Field(..., ge=-180, le=180, description="Kinh độ hiện tại của người dùng")
    radius: float = Field(default=5.0, ge=0.1, description="Bán kính tìm kiếm (đơn vị: km)")