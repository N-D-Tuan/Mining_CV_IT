from typing import List, Optional
from decimal import Decimal

from sqlalchemy import BIGINT, String, Text, Numeric
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[Optional[str]] = mapped_column(String(500))

    employer_name: Mapped[Optional[str]] = mapped_column(String(255))

    raw_salary: Mapped[Optional[str]] = mapped_column(String(255))

    min_salary: Mapped[Optional[int]] = mapped_column(BIGINT)

    max_salary: Mapped[Optional[int]] = mapped_column(BIGINT)

    salary_type: Mapped[Optional[str]] = mapped_column(String(50))

    city: Mapped[Optional[str]] = mapped_column(
        String(100),
        index=True
    )

    address: Mapped[Optional[str]] = mapped_column(Text)

    job_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        index=True
    )

    experience_required: Mapped[Optional[str]] = mapped_column(
        String(100)
    )

    requirements: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(Text)
    )

    post_content: Mapped[Optional[str]] = mapped_column(Text)

    link: Mapped[str] = mapped_column(
        Text,
        unique=True,
        nullable=False
    )

    source: Mapped[Optional[str]] = mapped_column(
        String(255)
    )

    # Thêm 2 thuộc tính lat, lng
    lat: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=8), 
        nullable=True
    )

    lng: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=11, scale=8), 
        nullable=True
    )

    saved_by_users: Mapped[List["SavedJob"]] = relationship(
        back_populates="job",
        cascade="all, delete-orphan"
    )

    applied_by_users: Mapped[List["AppliedJob"]] = relationship(
        back_populates="job",
        cascade="all, delete-orphan"
    )