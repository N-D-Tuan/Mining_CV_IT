from typing import TYPE_CHECKING, List
from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.association import SavedJob, AppliedJob

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # relationship
    saved_jobs: Mapped[List["SavedJob"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )
    applied_jobs: Mapped[List["AppliedJob"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )
