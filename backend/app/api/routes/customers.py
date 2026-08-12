from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import require_analyst
from app.database.session import get_db
from app.models.user import User
from app.schemas.customer import CustomerListResponse, CustomerSummary
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("", response_model=CustomerListResponse)
def list_customers(
    search: str | None = Query(default=None, description="Matches name, email, or company"),
    status: str | None = Query(default=None, description="'All', 'Active', or 'Inactive'"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=5, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst()),
):
    return CustomerService(db).list_customers(search=search, status=status, page=page, page_size=page_size)


@router.get("/summary", response_model=CustomerSummary)
def get_customer_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst()),
):
    """Card totals (Total/Active/Revenue) over the whole customer base,
    fetched once and independent of the list's search/filter/page state -
    mirrors the original page's behavior.

    Restricted to ADMIN/ANALYST: customer contact data is treated as
    business data, not something the VIEWER (read-only) role can see.
    """
    return CustomerService(db).get_summary()
