# from fastapi import APIRouter, Depends, Query
# from sqlalchemy.orm import Session

# from app.core.deps import require_analyst
# from app.database.session import get_db
# from app.models.user import User
# from app.schemas.customer import CustomerListResponse, CustomerSummary
# from app.services.customer_service import CustomerService

# router = APIRouter(prefix="/api/customers", tags=["customers"])


# @router.get("", response_model=CustomerListResponse)
# def list_customers(
#     search: str | None = Query(default=None, description="Matches name, email, or company"),
#     status: str | None = Query(default=None, description="'All', 'Active', or 'Inactive'"),
#     page: int = Query(default=1, ge=1),
#     page_size: int = Query(default=5, ge=1, le=100),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(require_analyst()),
# ):
#     return CustomerService(db).list_customers(search=search, status=status, page=page, page_size=page_size)


# @router.get("/summary", response_model=CustomerSummary)
# def get_customer_summary(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(require_analyst()),
# ):
#     """Card totals (Total/Active/Revenue) over the whole customer base,
#     fetched once and independent of the list's search/filter/page state -
#     mirrors the original page's behavior.

#     Restricted to ADMIN/ANALYST: customer contact data is treated as
#     business data, not something the VIEWER (read-only) role can see.
#     """
#     return CustomerService(db).get_summary()




from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.database.session import get_db
from app.models.user import User
from app.schemas.customer import (
    CustomerCreate,
    CustomerListResponse,
    CustomerOut,
    CustomerStatusUpdate,
    CustomerUpdate,
)
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("", response_model=CustomerListResponse)
def list_customers(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, description="Matches name, code, email, or company"),
    segment: str | None = Query(default=None),
    region: str | None = Query(default=None),
    status: str | None = Query(default=None, description="'All', 'ACTIVE', or 'INACTIVE'"),
    country: str | None = Query(default=None),
    sortBy: str | None = Query(default="created_at"),
    sortOrder: str | None = Query(default="desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Read access: ADMIN, ANALYST, and VIEWER can all view/search/filter/sort.
    return CustomerService(db).list_customers(search, segment, region, status, country, page, limit, sortBy, sortOrder)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CustomerService(db).get_customer(customer_id)


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin())):
    return CustomerService(db).create_customer(payload)


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin())):
    return CustomerService(db).update_customer(customer_id, payload)


@router.patch("/{customer_id}/status", response_model=CustomerOut)
def update_customer_status(customer_id: int, payload: CustomerStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin())):
    """Deactivate/reactivate - never a hard delete (see CustomerService.set_status)."""
    return CustomerService(db).set_status(customer_id, payload)