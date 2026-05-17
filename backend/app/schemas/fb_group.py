from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class CreateFBGroupRequest(BaseModel):

    name: str = Field(
        min_length=1,
        max_length=255
    )

    url: HttpUrl

    max_posts_per_crawl: int = Field(
        default=5,
        ge=1,
        le=100
    )

class UpdateFBGroupRequest(BaseModel):

    name: Optional[str] = Field(
        default=None,
        max_length=255
    )

    url: Optional[str] = Field(default=None)

    status: Optional[str] = Field(
        default=None,
        pattern="^(active|inactive|paused)$"
    )

    max_posts_per_crawl: Optional[int] = Field(
        default=None,
        ge=1,
        le=100
    )

class FBGroupResponse(BaseModel):

    id: int

    name: str

    url: str

    status: str

    crawl_count_today: int

    last_crawl: Optional[datetime]

    max_posts_per_crawl: int

    created_at: datetime

    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

