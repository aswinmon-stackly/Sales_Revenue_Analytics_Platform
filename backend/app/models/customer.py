# import enum
# from datetime import date, datetime, timezone

# from sqlalchemy import String, Date, DateTime, Enum, Index
# from sqlalchemy.orm import Mapped, mapped_column

# from app.database.base import Base


# class CustomerStatus(str, enum.Enum):
#     ACTIVE = "Active"
#     INACTIVE = "Inactive"


# class Customer(Base):
#     """
#     A customer contact. `company` is matched against `Sale.customer_name`
#     (which holds company names, e.g. "Acme Corporation") to derive each
#     customer's order count and total spend - there's no customer_id FK on
#     Sale yet, so the join is by company name. See backend README for the
#     tracked follow-up to make that a real foreign key.
#     """

#     __tablename__ = "customers"
#     __table_args__ = (Index("ix_customers_company", "company"),)

#     id: Mapped[int] = mapped_column(primary_key=True, index=True)
#     name: Mapped[str] = mapped_column(String(255), nullable=False)
#     email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
#     company: Mapped[str] = mapped_column(String(255), nullable=False)
#     status: Mapped[CustomerStatus] = mapped_column(
#         Enum(CustomerStatus), nullable=False, default=CustomerStatus.ACTIVE
#     )
#     joined_date: Mapped[date] = mapped_column(Date, nullable=False)
#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime(timezone=True),
#         default=lambda: datetime.now(timezone.utc),
#         onupdate=lambda: datetime.now(timezone.utc),
#     )




import enum
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class CustomerStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class CustomerSegment(str, enum.Enum):
    ENTERPRISE = "Enterprise"
    PREMIUM = "Premium"
    STANDARD = "Standard"
    NEW = "New"
    AT_RISK = "At Risk"


class Customer(Base):
    """
    Customer master data (Task 3). Deliberately has no FK to Sale yet -
    the spec calls for Customer -> Orders -> Order Items in a later task,
    so `id` just needs to stay a stable, safely-referenceable primary key
    for that future FK. Not to be confused with `Sale.customer_name`,
    which is free-text and still the only customer signal Sales/Dashboard/
    Reports read from - those are unaffected by this table.
    """

    __tablename__ = "customers"
    __table_args__ = (
        Index("ix_customers_segment", "segment"),
        Index("ix_customers_region", "region"),
        Index("ix_customers_status", "status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    customer_code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    region: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)

    segment: Mapped[CustomerSegment] = mapped_column(
        Enum(CustomerSegment), nullable=False, default=CustomerSegment.NEW
    )
    status: Mapped[CustomerStatus] = mapped_column(
        Enum(CustomerStatus), nullable=False, default=CustomerStatus.ACTIVE
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )