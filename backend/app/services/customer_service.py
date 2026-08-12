import math

from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.repositories.customer_repository import CustomerRepository
from app.repositories.sale_repository import SaleRepository
from app.schemas.customer import CustomerListResponse, CustomerOut, CustomerSummary

MAX_PAGE_SIZE = 100


class CustomerService:
    def __init__(self, db: Session):
        self.repo = CustomerRepository(db)
        self.sale_repo = SaleRepository(db)

    def _to_customer_out(self, customer: Customer, orders_by_company: dict[str, tuple[int, float]]) -> CustomerOut:
        orders, total_spent = orders_by_company.get(customer.company, (0, 0.0))
        return CustomerOut(
            id=f"CUS-{customer.id:04d}",
            name=customer.name,
            email=customer.email,
            company=customer.company,
            orders=orders,
            total_spent=total_spent,
            status=customer.status,
            joined_date=customer.joined_date.strftime("%d %b %Y"),
        )

    def list_customers(
        self, search: str | None, status: str | None, page: int, page_size: int
    ) -> CustomerListResponse:
        page = max(page, 1)
        page_size = min(max(page_size, 1), MAX_PAGE_SIZE)

        items, total = self.repo.list_customers(search, status, page, page_size)
        orders_by_company = self.sale_repo.orders_and_spend_by_company()
        total_pages = max(math.ceil(total / page_size), 1) if total else 0

        return CustomerListResponse(
            items=[self._to_customer_out(c, orders_by_company) for c in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def get_summary(self) -> CustomerSummary:
        """Card totals are intentionally over the *entire* customer base,
        not the current filter - matching the original page's behavior."""
        all_customers = self.repo.get_all()
        orders_by_company = self.sale_repo.orders_and_spend_by_company()

        total_customers = len(all_customers)
        active_customers = sum(1 for c in all_customers if c.status.value == "Active")
        total_revenue = sum(
            orders_by_company.get(c.company, (0, 0.0))[1] for c in all_customers
        )

        return CustomerSummary(
            total_customers=total_customers,
            active_customers=active_customers,
            total_revenue=total_revenue,
        )
