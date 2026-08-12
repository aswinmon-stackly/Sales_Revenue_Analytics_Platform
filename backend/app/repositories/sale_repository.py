from datetime import date

from sqlalchemy import func, or_, extract
from sqlalchemy.orm import Session

from app.models.sale import Sale, SaleStatus


class SaleRepository:
    """Encapsulates all direct DB access for the Sale model."""

    def __init__(self, db: Session):
        self.db = db

    # -- Sales page -----------------------------------------------------

    def _filtered_query(self, search: str | None, status: str | None, category: str | None):
        query = self.db.query(Sale)

        if search:
            like = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Sale.order_number.ilike(like),
                    Sale.customer_name.ilike(like),
                    Sale.product.ilike(like),
                )
            )

        if status and status != "All":
            query = query.filter(Sale.status == status)

        if category and category != "All":
            query = query.filter(Sale.category == category)

        return query

    def list_sales(
        self,
        search: str | None,
        status: str | None,
        category: str | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Sale], int, float, int]:
        """Returns (items, total_count, total_revenue, completed_count) for
        the filtered set - matching what the Sales page previously derived
        client-side from the full mock array."""
        base_query = self._filtered_query(search, status, category)

        total = base_query.count()

        total_revenue = base_query.with_entities(func.coalesce(func.sum(Sale.amount), 0)).scalar()
        completed_count = base_query.filter(Sale.status == SaleStatus.COMPLETED).count()

        items = (
            base_query.order_by(Sale.sale_date.desc(), Sale.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return items, total, float(total_revenue), completed_count

    def get_recent(self, limit: int = 5) -> list[Sale]:
        return (
            self.db.query(Sale)
            .order_by(Sale.sale_date.desc(), Sale.id.desc())
            .limit(limit)
            .all()
        )

    # -- Dashboard --------------------------------------------------------

    def total_revenue_and_orders(self) -> tuple[float, int]:
        row = self.db.query(
            func.coalesce(func.sum(Sale.amount), 0),
            func.count(Sale.id),
        ).one()
        return float(row[0]), int(row[1])

    def distinct_customer_count(self, start: date | None = None, end: date | None = None) -> int:
        query = self.db.query(func.count(func.distinct(Sale.customer_name)))
        if start:
            query = query.filter(Sale.sale_date >= start)
        if end:
            query = query.filter(Sale.sale_date < end)
        return int(query.scalar() or 0)

    def revenue_and_orders_for_range(self, start: date, end: date) -> tuple[float, int]:
        row = (
            self.db.query(
                func.coalesce(func.sum(Sale.amount), 0),
                func.count(Sale.id),
            )
            .filter(Sale.sale_date >= start, Sale.sale_date < end)
            .one()
        )
        return float(row[0]), int(row[1])

    def monthly_revenue(self, year: int) -> dict[int, float]:
        """Revenue grouped by calendar month (1-12) for the given year."""
        rows = (
            self.db.query(
                extract("month", Sale.sale_date).label("month"),
                func.coalesce(func.sum(Sale.amount), 0).label("revenue"),
            )
            .filter(extract("year", Sale.sale_date) == year)
            .group_by(extract("month", Sale.sale_date))
            .all()
        )
        return {int(month): float(revenue) for month, revenue in rows}

    # -- Reports ----------------------------------------------------------

    def status_breakdown(self) -> list[tuple[SaleStatus, int]]:
        rows = (
            self.db.query(Sale.status, func.count(Sale.id))
            .group_by(Sale.status)
            .all()
        )
        return [(status, int(count)) for status, count in rows]

    def category_breakdown(self) -> list[tuple[str, float, int]]:
        rows = (
            self.db.query(
                Sale.category,
                func.coalesce(func.sum(Sale.amount), 0),
                func.count(Sale.id),
            )
            .group_by(Sale.category)
            .order_by(func.sum(Sale.amount).desc())
            .all()
        )
        return [(category, float(total), int(count)) for category, total, count in rows]

    def top_customers(self, limit: int = 5) -> list[tuple[str, int, float]]:
        rows = (
            self.db.query(
                Sale.customer_name,
                func.count(Sale.id),
                func.coalesce(func.sum(Sale.amount), 0),
            )
            .group_by(Sale.customer_name)
            .order_by(func.sum(Sale.amount).desc())
            .limit(limit)
            .all()
        )
        return [(name, int(count), float(total)) for name, count, total in rows]

    # -- Shared by Customers page (orders/spend per company) --------------

    def orders_and_spend_by_company(self) -> dict[str, tuple[int, float]]:
        """Maps Sale.customer_name (a company name) -> (order_count, total_spent).
        Used by CustomerRepository to enrich each Customer with real order
        history, since Sale has no customer_id FK yet (see Customer model)."""
        rows = (
            self.db.query(
                Sale.customer_name,
                func.count(Sale.id),
                func.coalesce(func.sum(Sale.amount), 0),
            )
            .group_by(Sale.customer_name)
            .all()
        )
        return {name: (int(count), float(total)) for name, count, total in rows}
