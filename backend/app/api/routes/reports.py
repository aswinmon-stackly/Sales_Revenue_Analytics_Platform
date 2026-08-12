from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import require_analyst
from app.database.session import get_db
from app.models.user import User
from app.schemas.report import ReportSummary
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary", response_model=ReportSummary)
def get_report_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst()),
):
    """Single aggregate payload backing every widget on the Reports page
    (revenue/growth, status breakdown, category breakdown, top customers).
    Reuses SaleRepository - the same data path Sales/Dashboard read from.

    Restricted to ADMIN/ANALYST, same as Customers - reports are treated
    as business/analytics data, not part of the VIEWER role's read-only
    scope (Dashboard + Sales).
    """
    return ReportService(db).get_summary()
