"""
Creates the `customers` table (if not present) and seeds one contact per
company - the same company names used in seed_sales.py's CUSTOMERS list, so
each customer's order count/spend (joined by company name) has real data.

Run from the backend/ directory, after seed_sales.py, via:

    python seed_customers.py

Local development seed data only - not meant for production use.
"""
from datetime import date, timedelta

from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.models.customer import Customer, CustomerStatus
from app.models.sale import Sale  # noqa: F401 - ensures Base.metadata knows about all tables
from app.models.user import User  # noqa: F401

# (person name, email, company, status) - company values match seed_sales.py's
# CUSTOMERS list so Sale.customer_name -> Customer.company joins resolve.
SEED_CUSTOMERS = [
    ("Arun Kumar", "arun.kumar@example.com", "Acme Corporation", CustomerStatus.ACTIVE),
    ("Priya Sharma", "priya.sharma@example.com", "Tech Solutions Ltd", CustomerStatus.ACTIVE),
    ("Rahul Raj", "rahul.raj@example.com", "Global Enterprises", CustomerStatus.ACTIVE),
    ("Sneha Devi", "sneha.devi@example.com", "Prime Industries", CustomerStatus.INACTIVE),
    ("Vijay Kumar", "vijay.kumar@example.com", "Digital Works", CustomerStatus.ACTIVE),
    ("Karthik S", "karthik.s@example.com", "Bright Systems", CustomerStatus.ACTIVE),
    ("Divya Menon", "divya.menon@example.com", "Vertex Solutions", CustomerStatus.INACTIVE),
    ("Suresh Babu", "suresh.babu@example.com", "NextGen Corp", CustomerStatus.ACTIVE),
    ("Meera Iyer", "meera.iyer@example.com", "Summit Traders", CustomerStatus.ACTIVE),
    ("Anand Rao", "anand.rao@example.com", "Orion Retail", CustomerStatus.ACTIVE),
    ("Lakshmi Narayan", "lakshmi.narayan@example.com", "Blue Ridge Logistics", CustomerStatus.INACTIVE),
    ("Kiran Reddy", "kiran.reddy@example.com", "Falcon Manufacturing", CustomerStatus.ACTIVE),
]


def run():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Customer).count() > 0:
            print("Customers table already has data - skipping seed. "
                  "Delete existing rows first if you want to reseed.")
            return

        today = date.today()
        rows = []
        for index, (name, email, company, status) in enumerate(SEED_CUSTOMERS):
            rows.append(
                Customer(
                    name=name,
                    email=email,
                    company=company,
                    status=status,
                    # Spread join dates over the trailing year for realism.
                    joined_date=today - timedelta(days=30 * (index + 1)),
                )
            )

        db.add_all(rows)
        db.commit()
        print(f"Seeded {len(rows)} customers.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
