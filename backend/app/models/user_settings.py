from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class UserSettings(Base):
    """One row per user, created lazily with defaults on first GET. Holds
    only display/notification preferences - profile fields (name/email)
    live on the User model itself and are edited via PUT /api/users/me."""

    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )

    default_page_size: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    default_sort_field: Mapped[str] = mapped_column(String(50), nullable=False, default="Order Date")
    default_sort_order: Mapped[str] = mapped_column(String(20), nullable=False, default="Descending")
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="INR")

    email_notifications: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    weekly_summary_email: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    low_stock_alerts: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
