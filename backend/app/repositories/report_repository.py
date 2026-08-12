from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.sale import Sale, SaleStatus


class ReportRepository:
    """
    Handles all database queries required for the Reports page.
    All report data comes from the sales table.
    """

    def __init__(self, db: Session):
        self.db = db

    # ---------------------------------------------------------
    # Top Customers
    # ---------------------------------------------------------

    def get_top_customers(self, limit: int = 5):
        rows = (
            self.db.query(
                Sale.customer_name,
                func.coalesce(func.sum(Sale.amount), 0).label("revenue"),
                func.count(Sale.id).label("orders"),
            )
            .group_by(Sale.customer_name)
            .order_by(
                func.sum(Sale.amount).desc()
            )
            .limit(limit)
            .all()
        )

        return rows

    # ---------------------------------------------------------
    # Status Breakdown
    # ---------------------------------------------------------

    def get_status_breakdown(self):
        total_orders = self.db.query(
            func.count(Sale.id)
        ).scalar() or 0

        rows = (
            self.db.query(
                Sale.status,
                func.count(Sale.id).label("count"),
            )
            .group_by(Sale.status)
            .all()
        )

        return rows, int(total_orders)

    # ---------------------------------------------------------
    # Revenue This Month
    # ---------------------------------------------------------

    def get_revenue_this_month(self):
        today = date.today()

        start_of_month = today.replace(day=1)

        if today.month == 12:
            start_of_next_month = date(
                today.year + 1,
                1,
                1,
            )
        else:
            start_of_next_month = date(
                today.year,
                today.month + 1,
                1,
            )

        row = (
            self.db.query(
                func.coalesce(func.sum(Sale.amount), 0),
                func.count(Sale.id),
            )
            .filter(
                Sale.sale_date >= start_of_month,
                Sale.sale_date < start_of_next_month,
            )
            .one()
        )

        return float(row[0]), int(row[1])

    # ---------------------------------------------------------
    # Revenue by Category Month-over-Month
    # ---------------------------------------------------------

    def get_category_monthly_revenue(self, months: int = 12):
        today = date.today()

        current_month_start = today.replace(day=1)

        # Calculate starting month
        total_months = (
            current_month_start.year * 12
            + current_month_start.month
            - 1
        )

        start_total_months = total_months - (months - 1)

        start_year = start_total_months // 12
        start_month = (start_total_months % 12) + 1

        start_date = date(
            start_year,
            start_month,
            1,
        )

        rows = (
            self.db.query(
                Sale.sale_date,
                Sale.category,
                func.coalesce(
                    func.sum(Sale.amount),
                    0,
                ).label("revenue"),
            )
            .filter(
                Sale.sale_date >= start_date,
                Sale.sale_date <= today,
            )
            .group_by(
                Sale.sale_date,
                Sale.category,
            )
            .all()
        )

        return rows