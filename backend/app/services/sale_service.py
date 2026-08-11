import math

from sqlalchemy.orm import Session

from app.models.sale import Sale
from app.repositories.sale_repository import SaleRepository
from app.schemas.sale import SaleListResponse, SaleOut

MAX_PAGE_SIZE = 100


def to_sale_out(sale: Sale) -> SaleOut:
    return SaleOut(
        id=sale.order_number,
        customer=sale.customer_name,
        product=sale.product,
        category=sale.category,
        amount=float(sale.amount),
        status=sale.status,
        date=sale.sale_date.strftime("%d %b %Y"),
    )


class SaleService:
    def __init__(self, db: Session):
        self.repo = SaleRepository(db)

    def list_sales(
        self,
        search: str | None,
        status: str | None,
        category: str | None,
        page: int,
        page_size: int,
    ) -> SaleListResponse:
        page = max(page, 1)
        page_size = min(max(page_size, 1), MAX_PAGE_SIZE)

        items, total, total_revenue, completed_count = self.repo.list_sales(
            search=search, status=status, category=category, page=page, page_size=page_size
        )

        total_pages = max(math.ceil(total / page_size), 1) if total else 0

        return SaleListResponse(
            items=[to_sale_out(s) for s in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            total_revenue=total_revenue,
            completed_orders=completed_count,
        )
