from sqlalchemy import ForeignKey

from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        primary_key=True
    )

    user: Mapped["User"] = relationship(
        back_populates="saved_jobs"
    )

    job: Mapped["Job"] = relationship(
        back_populates="saved_by_users"
    )


class AppliedJob(Base):
    __tablename__ = "applied_jobs"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        primary_key=True
    )

    user: Mapped["User"] = relationship(
        back_populates="applied_jobs"
    )

    job: Mapped["Job"] = relationship(
        back_populates="applied_by_users"
    )