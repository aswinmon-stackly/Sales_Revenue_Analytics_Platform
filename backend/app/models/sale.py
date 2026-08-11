import enum
from datetime import date, datetime, timezone

from sqlalchemy import String, Numeric, Date, DateTime, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class SaleStatus(str, enum.Enum):
    COMPLETED = "Completed"
    PROCESSING = "Processing"
    PENDING = "Pending"
    CANCELLED = "Cancelled"


class Sale(Base):
    """
    A single sales transaction/order. This is the single source of truth for
    both the Sales page (transaction table) and the Dashboard (summary cards,
    revenue chart, recent orders) - both read from this table so there is
    only one API/data path to maintain.
    """

    __tablename__ = "sales"
    __table_args__ = (
        Index("ix_sales_sale_date", "sale_date"),
        Index("ix_sales_status", "status"),
        Index("ix_sales_category", "category"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_number: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    product: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[SaleStatus] = mapped_column(Enum(SaleStatus), nullable=False, default=SaleStatus.PENDING)
    sale_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
