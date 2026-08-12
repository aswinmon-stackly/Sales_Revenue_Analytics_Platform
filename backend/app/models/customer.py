import enum
from datetime import date, datetime, timezone

from sqlalchemy import String, Date, DateTime, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class CustomerStatus(str, enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"


class Customer(Base):
    """
    A customer contact. `company` is matched against `Sale.customer_name`
    (which holds company names, e.g. "Acme Corporation") to derive each
    customer's order count and total spend - there's no customer_id FK on
    Sale yet, so the join is by company name. See backend README for the
    tracked follow-up to make that a real foreign key.
    """

    __tablename__ = "customers"
    __table_args__ = (Index("ix_customers_company", "company"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[CustomerStatus] = mapped_column(
        Enum(CustomerStatus), nullable=False, default=CustomerStatus.ACTIVE
    )
    joined_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
