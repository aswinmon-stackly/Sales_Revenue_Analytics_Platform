import calendar
from datetime import date

from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.sale_repository import SaleRepository
from app.schemas.sale import DashboardSummary, MonthlyRevenuePoint, MonthlyTarget
from app.services.date_utils import month_bounds, pct_change, shift_month
from app.services.sale_service import to_sale_out

RECENT_ORDERS_LIMIT = 5
TRAILING_MONTHS = 12


class DashboardService:
    def __init__(self, db: Session):
        self.repo = SaleRepository(db)

    def get_summary(self, today: date | None = None) -> DashboardSummary:
        today = today or date.today()
        cur_year, cur_month = today.year, today.month
        prev_year, prev_month = shift_month(cur_year, cur_month, -1)
        prev2_year, prev2_month = shift_month(cur_year, cur_month, -2)

        cur_start, cur_end = month_bounds(cur_year, cur_month)
        prev_start, prev_end = month_bounds(prev_year, prev_month)
        prev2_start, prev2_end = month_bounds(prev2_year, prev2_month)

        total_revenue, total_orders = self.repo.total_revenue_and_orders()
        total_customers = self.repo.distinct_customer_count()

        cur_revenue, cur_orders = self.repo.revenue_and_orders_for_range(cur_start, cur_end)
        prev_revenue, prev_orders = self.repo.revenue_and_orders_for_range(prev_start, prev_end)
        prev2_revenue, _ = self.repo.revenue_and_orders_for_range(prev2_start, prev2_end)

        cur_customers = self.repo.distinct_customer_count(cur_start, cur_end)
        prev_customers = self.repo.distinct_customer_count(prev_start, prev_end)

        revenue_change_pct = pct_change(cur_revenue, prev_revenue)
        orders_change_pct = pct_change(cur_orders, prev_orders)
        customers_change_pct = pct_change(cur_customers, prev_customers)

        # "Growth" is defined here as the month-over-month revenue growth
        # rate; its own "change" is how much that growth rate itself moved
        # versus the prior month's growth rate. This is a reasonable default
        # definition, not a fixed business requirement - confirm with
        # stakeholders and adjust here if a different metric is wanted.
        growth_pct = revenue_change_pct
        prev_growth_pct = pct_change(prev_revenue, prev2_revenue)
        growth_change_pct = round(growth_pct - prev_growth_pct, 1)

        # Trailing 12 months of revenue, oldest -> newest, ending this month.
        monthly_points: list[MonthlyRevenuePoint] = []
        by_year: dict[int, dict[int, float]] = {}
        for offset in range(TRAILING_MONTHS - 1, -1, -1):
            y, m = shift_month(cur_year, cur_month, -offset)
            if y not in by_year:
                by_year[y] = self.repo.monthly_revenue(y)
            monthly_points.append(
                MonthlyRevenuePoint(month=calendar.month_abbr[m], revenue=by_year[y].get(m, 0.0))
            )

        target_amount = settings.MONTHLY_REVENUE_TARGET
        achieved_pct = round((cur_revenue / target_amount) * 100, 1) if target_amount else 0.0

        recent = self.repo.get_recent(RECENT_ORDERS_LIMIT)

        return DashboardSummary(
            total_revenue=total_revenue,
            revenue_change_pct=revenue_change_pct,
            total_orders=total_orders,
            orders_change_pct=orders_change_pct,
            total_customers=total_customers,
            customers_change_pct=customers_change_pct,
            growth_pct=growth_pct,
            growth_change_pct=growth_change_pct,
            monthly_revenue=monthly_points,
            monthly_target=MonthlyTarget(
                target_amount=target_amount,
                achieved_amount=cur_revenue,
                achieved_pct=achieved_pct,
            ),
            recent_orders=[to_sale_out(s) for s in recent],
        )

