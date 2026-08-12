"""
Creates the `sales` table (if not present) and seeds it with sales
transactions spread across the trailing 12 months, so the Dashboard's
revenue chart and the Sales page both have real data to read from
PostgreSQL instead of the old frontend mock arrays.

Run from the backend/ directory, with your virtualenv active and .env
configured, via:

    python seed_sales.py

Local development seed data only - not meant for production use.
"""
import random
from datetime import date, timedelta

from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.models.sale import Sale, SaleStatus
from app.models.user import User  # noqa: F401 - ensures Base.metadata knows about all tables

random.seed(42)

CUSTOMERS = [
    "Acme Corporation", "Tech Solutions Ltd", "Global Enterprises", "Prime Industries",
    "Digital Works", "Bright Systems", "Vertex Solutions", "NextGen Corp",
    "Summit Traders", "Orion Retail", "Blue Ridge Logistics", "Falcon Manufacturing",
]

PRODUCTS = [
    ("Enterprise Software", "Software"),
    ("Analytics Platform", "Software"),
    ("CRM Subscription", "Software"),
    ("Developer Tools", "Software"),
    ("Laptop Pro", "Electronics"),
    ("Wireless Devices", "Electronics"),
    ("Networking Kit", "Electronics"),
    ("Cloud Services", "Services"),
    ("Consulting Services", "Services"),
    ("Support Retainer", "Services"),
]

STATUS_WEIGHTS = [
    (SaleStatus.COMPLETED, 0.60),
    (SaleStatus.PROCESSING, 0.18),
    (SaleStatus.PENDING, 0.14),
    (SaleStatus.CANCELLED, 0.08),
]


def random_status() -> SaleStatus:
    r = random.random()
    cumulative = 0.0
    for status, weight in STATUS_WEIGHTS:
        cumulative += weight
        if r <= cumulative:
            return status
    return SaleStatus.COMPLETED


def month_start(d: date) -> date:
    return d.replace(day=1)


def shift_months(d: date, months: int) -> date:
    total = d.year * 12 + (d.month - 1) + months
    return date(total // 12, (total % 12) + 1, 1)


def run():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Sale).count() > 0:
            print("Sales table already has data - skipping seed. "
                  "Delete existing rows first if you want to reseed.")
            return

        today = date.today()
        rows: list[Sale] = []
        order_seq = 1000

        # ~8-14 orders per month for the trailing 12 months.
        for offset in range(11, -1, -1):
            m_start = shift_months(month_start(today), -offset)
            next_month = shift_months(m_start, 1)
            days_in_month = (next_month - m_start).days
            order_count = random.randint(8, 14)

            for _ in range(order_count):
                order_seq += 1
                sale_day = m_start + timedelta(days=random.randint(0, days_in_month - 1))
                if sale_day > today:
                    sale_day = today
                product, category = random.choice(PRODUCTS)
                rows.append(
                    Sale(
                        order_number=f"ORD-{order_seq}",
                        customer_name=random.choice(CUSTOMERS),
                        product=product,
                        category=category,
                        amount=round(random.uniform(8000, 48000), 2),
                        status=random_status(),
                        sale_date=sale_day,
                    )
                )

        db.add_all(rows)
        db.commit()
        print(f"Seeded {len(rows)} sales rows across the trailing 12 months.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
