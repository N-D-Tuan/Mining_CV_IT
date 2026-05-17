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