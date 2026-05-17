from datetime import datetime
from typing import List, Optional

from sqlalchemy import ForeignKey, Integer, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    expected_salary: Mapped[Optional[int]] = mapped_column(Integer)
    city: Mapped[Optional[str]] = mapped_column(String(100))
    experience: Mapped[Optional[str]] = mapped_column(Text)
    favorite_jobs: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text))
    skills: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )