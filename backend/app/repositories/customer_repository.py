from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.customer import Customer


class CustomerRepository:
    def __init__(self, db: Session):
        self.db = db

    def _filtered_query(self, search: str | None, status: str | None):
        query = self.db.query(Customer)

        if search:
            like = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Customer.name.ilike(like),
                    Customer.email.ilike(like),
                    Customer.company.ilike(like),
                )
            )

        if status and status != "All":
            query = query.filter(Customer.status == status)

        return query

    def list_customers(
        self, search: str | None, status: str | None, page: int, page_size: int
    ) -> tuple[list[Customer], int]:
        query = self._filtered_query(search, status)
        total = query.count()
        items = (
            query.order_by(Customer.joined_date.desc(), Customer.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    def get_all(self) -> list[Customer]:
        return self.db.query(Customer).all()
