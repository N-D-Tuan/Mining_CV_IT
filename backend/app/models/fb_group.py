from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, TimestampMixin


class FBGroup(Base, TimestampMixin):
    __tablename__ = "fb_groups"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    url: Mapped[str] = mapped_column(
        Text,
        unique=True,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="active"
    )

    crawl_count_today: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    last_crawl: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )

    max_posts_per_crawl: Mapped[int] = mapped_column(
        Integer,
        default=5
    )