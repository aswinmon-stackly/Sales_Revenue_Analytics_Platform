from datetime import date

from sqlalchemy.orm import Session

from app.repositories.sale_repository import SaleRepository
from app.schemas.report import CategoryStat, CustomerStat, ReportSummary, StatusCount
from app.services.date_utils import month_bounds, pct_change, shift_month

TOP_CUSTOMERS_LIMIT = 5


class ReportService:
    def __init__(self, db: Session):
        self.repo = SaleRepository(db)

    def get_summary(self, today: date | None = None) -> ReportSummary:
        today = today or date.today()
        cur_year, cur_month = today.year, today.month
        prev_year, prev_month = shift_month(cur_year, cur_month, -1)

        cur_start, cur_end = month_bounds(cur_year, cur_month)
        prev_start, prev_end = month_bounds(prev_year, prev_month)

        current_revenue, _ = self.repo.revenue_and_orders_for_range(cur_start, cur_end)
        previous_revenue, _ = self.repo.revenue_and_orders_for_range(prev_start, prev_end)
        growth_pct = pct_change(current_revenue, previous_revenue)

        status_breakdown = [
            StatusCount(status=status.value, count=count)
            for status, count in self.repo.status_breakdown()
        ]

        category_breakdown = [
            CategoryStat(category=category, sales=sales, orders=orders)
            for category, sales, orders in self.repo.category_breakdown()
        ]

        top_customers = [
            CustomerStat(name=name, orders=orders, spending=spending)
            for name, orders, spending in self.repo.top_customers(TOP_CUSTOMERS_LIMIT)
        ]

        return ReportSummary(
            current_revenue=current_revenue,
            previous_revenue=previous_revenue,
            growth_pct=growth_pct,
            status_breakdown=status_breakdown,
            category_breakdown=category_breakdown,
            top_customers=top_customers,
        )
