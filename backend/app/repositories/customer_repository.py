# from sqlalchemy import or_
# from sqlalchemy.orm import Session

# from app.models.customer import Customer


# class CustomerRepository:
#     def __init__(self, db: Session):
#         self.db = db

#     def _filtered_query(self, search: str | None, status: str | None):
#         query = self.db.query(Customer)

#         if search:
#             like = f"%{search.strip()}%"
#             query = query.filter(
#                 or_(
#                     Customer.name.ilike(like),
#                     Customer.email.ilike(like),
#                     Customer.company.ilike(like),
#                 )
#             )

#         if status and status != "All":
#             query = query.filter(Customer.status == status)

#         return query

#     def list_customers(
#         self, search: str | None, status: str | None, page: int, page_size: int
#     ) -> tuple[list[Customer], int]:
#         query = self._filtered_query(search, status)
#         total = query.count()
#         items = (
#             query.order_by(Customer.joined_date.desc(), Customer.id.desc())
#             .offset((page - 1) * page_size)
#             .limit(page_size)
#             .all()
#         )
#         return items, total

#     def get_all(self) -> list[Customer]:
#         return self.db.query(Customer).all()





from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.customer import Customer

SORTABLE_FIELDS = {
    "name": Customer.name,
    "created_at": Customer.created_at,
    "company": Customer.company,
    "region": Customer.region,
}


class CustomerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, customer_id: int) -> Customer | None:
        return self.db.get(Customer, customer_id)

    def get_by_code(self, code: str) -> Customer | None:
        return self.db.query(Customer).filter(Customer.customer_code == code.upper()).first()

    def get_by_email(self, email: str) -> Customer | None:
        return self.db.query(Customer).filter(Customer.email.ilike(email)).first()

    def list_customers(self, search, segment, region, status, country, page, limit, sort_by, sort_order):
        query = self.db.query(Customer)

        if search:
            like = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Customer.name.ilike(like),
                    Customer.customer_code.ilike(like),
                    Customer.email.ilike(like),
                    Customer.company.ilike(like),
                )
            )

        if segment and segment != "All":
            query = query.filter(Customer.segment == segment)
        if region and region != "All":
            query = query.filter(Customer.region == region)
        if status and status != "All":
            query = query.filter(Customer.status == status)
        if country and country != "All":
            query = query.filter(Customer.country == country)

        total = query.count()

        sort_column = SORTABLE_FIELDS.get(sort_by or "created_at", Customer.created_at)
        query = query.order_by(
            sort_column.desc() if (sort_order or "desc").lower() == "desc" else sort_column.asc()
        )

        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    def create(self, customer: Customer) -> Customer:
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def save(self, customer: Customer) -> Customer:
        self.db.commit()
        self.db.refresh(customer)
        return customer