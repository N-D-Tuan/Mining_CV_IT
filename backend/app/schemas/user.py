from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from schemas.job import JobResponse


class UserProfileResponse(BaseModel):
    user_id: int

    expected_salary: Optional[int] = None

    city: Optional[str] = None

    experience: Optional[str] = None

    favorite_jobs: Optional[List[str]] = None

    skills: Optional[List[str]] = None

    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class RecommendedJobsQuery(BaseModel):
    lat: Optional[float] = Field(default=None, ge=-90, le=90)
    lng: Optional[float] = Field(default=None, ge=-180, le=180)
    radius: float = Field(default=20.0, ge=0.1)


class RecommendedJobsResponse(BaseModel):
    total_matching_jobs: int
    nearby_matching_jobs: Optional[int] = None
    radius: float
    profile_jobs: List[JobResponse] = Field(default_factory=list)
    nearby_jobs: List[JobResponse] = Field(default_factory=list)
