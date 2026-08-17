# import math

# from sqlalchemy.orm import Session

# from app.models.customer import Customer
# from app.repositories.customer_repository import CustomerRepository
# from app.repositories.sale_repository import SaleRepository
# from app.schemas.customer import CustomerListResponse, CustomerOut, CustomerSummary

# MAX_PAGE_SIZE = 100


# class CustomerService:
#     def __init__(self, db: Session):
#         self.repo = CustomerRepository(db)
#         self.sale_repo = SaleRepository(db)

#     def _to_customer_out(self, customer: Customer, orders_by_company: dict[str, tuple[int, float]]) -> CustomerOut:
#         orders, total_spent = orders_by_company.get(customer.company, (0, 0.0))
#         return CustomerOut(
#             id=f"CUS-{customer.id:04d}",
#             name=customer.name,
#             email=customer.email,
#             company=customer.company,
#             orders=orders,
#             total_spent=total_spent,
#             status=customer.status,
#             joined_date=customer.joined_date.strftime("%d %b %Y"),
#         )

#     def list_customers(
#         self, search: str | None, status: str | None, page: int, page_size: int
#     ) -> CustomerListResponse:
#         page = max(page, 1)
#         page_size = min(max(page_size, 1), MAX_PAGE_SIZE)

#         items, total = self.repo.list_customers(search, status, page, page_size)
#         orders_by_company = self.sale_repo.orders_and_spend_by_company()
#         total_pages = max(math.ceil(total / page_size), 1) if total else 0

#         return CustomerListResponse(
#             items=[self._to_customer_out(c, orders_by_company) for c in items],
#             total=total,
#             page=page,
#             page_size=page_size,
#             total_pages=total_pages,
#         )

#     def get_summary(self) -> CustomerSummary:
#         """Card totals are intentionally over the *entire* customer base,
#         not the current filter - matching the original page's behavior."""
#         all_customers = self.repo.get_all()
#         orders_by_company = self.sale_repo.orders_and_spend_by_company()

#         total_customers = len(all_customers)
#         active_customers = sum(1 for c in all_customers if c.status.value == "Active")
#         total_revenue = sum(
#             orders_by_company.get(c.company, (0, 0.0))[1] for c in all_customers
#         )

#         return CustomerSummary(
#             total_customers=total_customers,
#             active_customers=active_customers,
#             total_revenue=total_revenue,
#         )




import math

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import (
    CustomerCreate,
    CustomerListResponse,
    CustomerOut,
    CustomerStatusUpdate,
    CustomerUpdate,
)

MAX_LIMIT = 100


def _to_out(customer: Customer) -> CustomerOut:
    return CustomerOut(
        id=customer.id,
        customer_code=customer.customer_code,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        company=customer.company,
        address=customer.address,
        city=customer.city,
        state=customer.state,
        country=customer.country,
        region=customer.region,
        segment=customer.segment,
        status=customer.status,
        created_at=customer.created_at.isoformat(),
        updated_at=customer.updated_at.isoformat(),
    )


class CustomerService:
    def __init__(self, db: Session):
        self.repo = CustomerRepository(db)

    def list_customers(self, search, segment, region, status_, country, page, limit, sort_by, sort_order) -> CustomerListResponse:
        page = max(page, 1)
        limit = min(max(limit, 1), MAX_LIMIT)

        items, total = self.repo.list_customers(search, segment, region, status_, country, page, limit, sort_by, sort_order)
        total_pages = max(math.ceil(total / limit), 1) if total else 0

        return CustomerListResponse(
            data=[_to_out(c) for c in items], page=page, limit=limit, total=total, totalPages=total_pages,
        )

    def get_customer(self, customer_id: int) -> CustomerOut:
        customer = self.repo.get_by_id(customer_id)
        if customer is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
        return _to_out(customer)

    def _assert_unique(self, code: str, email: str, exclude_id: int | None = None) -> None:
        existing_code = self.repo.get_by_code(code)
        if existing_code and existing_code.id != exclude_id:
            raise HTTPException(status.HTTP_409_CONFLICT, f"Customer code '{code}' is already in use")
        existing_email = self.repo.get_by_email(email)
        if existing_email and existing_email.id != exclude_id:
            raise HTTPException(status.HTTP_409_CONFLICT, f"Email '{email}' is already in use")

    def create_customer(self, payload: CustomerCreate) -> CustomerOut:
        self._assert_unique(payload.customer_code, payload.email)

        customer = Customer(
            customer_code=payload.customer_code, name=payload.name, email=payload.email,
            phone=payload.phone, company=payload.company, address=payload.address,
            city=payload.city, state=payload.state, country=payload.country,
            region=payload.region, segment=payload.segment, status=payload.status,
        )
        customer = self.repo.create(customer)
        return _to_out(customer)

    def update_customer(self, customer_id: int, payload: CustomerUpdate) -> CustomerOut:
        customer = self.repo.get_by_id(customer_id)
        if customer is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")

        new_code = payload.customer_code or customer.customer_code
        new_email = payload.email or customer.email
        if new_code != customer.customer_code or new_email != customer.email:
            self._assert_unique(new_code, new_email, exclude_id=customer_id)

        for field in (
            "customer_code", "name", "email", "phone", "company",
            "address", "city", "state", "country", "region", "segment",
        ):
            value = getattr(payload, field)
            if value is not None:
                setattr(customer, field, value)

        customer = self.repo.save(customer)
        return _to_out(customer)

    def set_status(self, customer_id: int, payload: CustomerStatusUpdate) -> CustomerOut:
        """Deactivate/reactivate - never a hard delete, so historical sales
        (once linked, in a later task) can keep referencing this row."""
        customer = self.repo.get_by_id(customer_id)
        if customer is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")

        customer.status = payload.status
        customer = self.repo.save(customer)
        return _to_out(customer)