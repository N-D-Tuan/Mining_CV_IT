from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


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