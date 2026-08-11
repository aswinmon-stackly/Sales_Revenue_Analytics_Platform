from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.sale import DashboardSummary
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Single aggregate endpoint backing every widget on the Dashboard page
    (summary cards, revenue chart, monthly target gauge, recent orders) so
    the page makes one request instead of one per widget.
    """
    return DashboardService(db).get_summary()
