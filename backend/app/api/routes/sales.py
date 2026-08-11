from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.sale import SaleListResponse
from app.services.sale_service import SaleService

router = APIRouter(prefix="/api/sales", tags=["sales"])


@router.get("", response_model=SaleListResponse)
def list_sales(
    search: str | None = Query(default=None, description="Matches order number, customer, or product"),
    status: str | None = Query(default=None, description="'All' or a SaleStatus value"),
    category: str | None = Query(default=None, description="'All' or a category name"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=5, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Backs the Sales page table + its summary cards (Total Sales, Total
    Revenue, Completed Orders), which are computed server-side over the
    *filtered* result set. Any authenticated user can view sales data.
    """
    return SaleService(db).list_sales(
        search=search, status=status, category=category, page=page, page_size=page_size
    )
