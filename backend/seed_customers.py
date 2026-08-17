# """
# Creates the `customers` table (if not present) and seeds one contact per
# company - the same company names used in seed_sales.py's CUSTOMERS list, so
# each customer's order count/spend (joined by company name) has real data.

# Run from the backend/ directory, after seed_sales.py, via:

#     python seed_customers.py

# Local development seed data only - not meant for production use.
# """
# from datetime import date, timedelta

# from app.database.base import Base
# from app.database.session import engine, SessionLocal
# from app.models.customer import Customer, CustomerStatus
# from app.models.sale import Sale  # noqa: F401 - ensures Base.metadata knows about all tables
# from app.models.user import User  # noqa: F401

# # (person name, email, company, status) - company values match seed_sales.py's
# # CUSTOMERS list so Sale.customer_name -> Customer.company joins resolve.
# SEED_CUSTOMERS = [
#     ("Arun Kumar", "arun.kumar@example.com", "Acme Corporation", CustomerStatus.ACTIVE),
#     ("Priya Sharma", "priya.sharma@example.com", "Tech Solutions Ltd", CustomerStatus.ACTIVE),
#     ("Rahul Raj", "rahul.raj@example.com", "Global Enterprises", CustomerStatus.ACTIVE),
#     ("Sneha Devi", "sneha.devi@example.com", "Prime Industries", CustomerStatus.INACTIVE),
#     ("Vijay Kumar", "vijay.kumar@example.com", "Digital Works", CustomerStatus.ACTIVE),
#     ("Karthik S", "karthik.s@example.com", "Bright Systems", CustomerStatus.ACTIVE),
#     ("Divya Menon", "divya.menon@example.com", "Vertex Solutions", CustomerStatus.INACTIVE),
#     ("Suresh Babu", "suresh.babu@example.com", "NextGen Corp", CustomerStatus.ACTIVE),
#     ("Meera Iyer", "meera.iyer@example.com", "Summit Traders", CustomerStatus.ACTIVE),
#     ("Anand Rao", "anand.rao@example.com", "Orion Retail", CustomerStatus.ACTIVE),
#     ("Lakshmi Narayan", "lakshmi.narayan@example.com", "Blue Ridge Logistics", CustomerStatus.INACTIVE),
#     ("Kiran Reddy", "kiran.reddy@example.com", "Falcon Manufacturing", CustomerStatus.ACTIVE),
# ]


# def run():
#     Base.metadata.create_all(bind=engine)

#     db = SessionLocal()
#     try:
#         if db.query(Customer).count() > 0:
#             print("Customers table already has data - skipping seed. "
#                   "Delete existing rows first if you want to reseed.")
#             return

#         today = date.today()
#         rows = []
#         for index, (name, email, company, status) in enumerate(SEED_CUSTOMERS):
#             rows.append(
#                 Customer(
#                     name=name,
#                     email=email,
#                     company=company,
#                     status=status,
#                     # Spread join dates over the trailing year for realism.
#                     joined_date=today - timedelta(days=30 * (index + 1)),
#                 )
#             )

#         db.add_all(rows)
#         db.commit()
#         print(f"Seeded {len(rows)} customers.")
#     finally:
#         db.close()


# if __name__ == "__main__":
#     run()


"""
Seed script for the customers table (Task 3 schema).
Run after applying the schema migration and restarting the API:
    python seed_customers.py
"""

from datetime import datetime, timedelta, timezone

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.customer import Customer, CustomerSegment, CustomerStatus

CUSTOMERS = [
    dict(
        customer_code="CUST-1001",
        name="Olivia Bennett",
        email="olivia.bennett@northgatelogistics.com",
        phone="+1 415-555-0142",
        company="Northgate Logistics",
        address="482 Harbor View Rd",
        city="San Francisco",
        state="CA",
        country="United States",
        region="North America",
        segment=CustomerSegment.ENTERPRISE,
        status=CustomerStatus.ACTIVE,
    ),
    dict(
        customer_code="CUST-1002",
        name="Marcus Webb",
        email="marcus.webb@ironforgesteel.com",
        phone="+1 312-555-0198",
        company="Ironforge Steel Co.",
        address="19 Kestrel Industrial Park",
        city="Chicago",
        state="IL",
        country="United States",
        region="North America",
        segment=CustomerSegment.PREMIUM,
        status=CustomerStatus.ACTIVE,
    ),
    dict(
        customer_code="CUST-1003",
        name="Priya Raman",
        email="priya.raman@lumeninteriors.in",
        phone="+91 98765 43210",
        company="Lumen Interiors",
        address="14 Kavuri Hills, Jubilee Enclave",
        city="Hyderabad",
        state="Telangana",
        country="India",
        region="APAC",
        segment=CustomerSegment.STANDARD,
        status=CustomerStatus.ACTIVE,
    ),
    dict(
        customer_code="CUST-1004",
        name="Haruto Sato",
        email="h.sato@edoprecision.co.jp",
        phone="+81 3-5555-0176",
        company="Edo Precision Machining",
        address="2-14 Nihonbashi",
        city="Tokyo",
        state=None,
        country="Japan",
        region="APAC",
        segment=CustomerSegment.ENTERPRISE,
        status=CustomerStatus.ACTIVE,
    ),
    dict(
        customer_code="CUST-1005",
        name="Freya Lindqvist",
        email="freya.lindqvist@nordvikenergy.se",
        phone="+46 8-555-0123",
        company="Nordvik Energy AB",
        address="Sveavägen 44",
        city="Stockholm",
        state=None,
        country="Sweden",
        region="Europe",
        segment=CustomerSegment.PREMIUM,
        status=CustomerStatus.INACTIVE,
    ),
    dict(
        customer_code="CUST-1006",
        name="Diego Fernandez",
        email="diego.fernandez@pampatextiles.com.ar",
        phone="+54 11-5555-0187",
        company="Pampa Textiles",
        address="Av. Corrientes 2211",
        city="Buenos Aires",
        state=None,
        country="Argentina",
        region="South America",
        segment=CustomerSegment.STANDARD,
        status=CustomerStatus.ACTIVE,
    ),
    dict(
        customer_code="CUST-1007",
        name="Amara Nwosu",
        email="amara.nwosu@delta-fresh.ng",
        phone="+234 803-555-0166",
        company="Delta Fresh Produce",
        address="15 Ademola Adetokunbo Cres",
        city="Abuja",
        state=None,
        country="Nigeria",
        region="Africa",
        segment=CustomerSegment.NEW,
        status=CustomerStatus.ACTIVE,
    ),
    dict(
        customer_code="CUST-1008",
        name="Claire Dubois",
        email="claire.dubois@atelierclarte.fr",
        phone="+33 1 55 55 01 42",
        company="Atelier Clarté",
        address="12 Rue de Rivoli",
        city="Paris",
        state=None,
        country="France",
        region="Europe",
        segment=CustomerSegment.AT_RISK,
        status=CustomerStatus.ACTIVE,
    ),
    dict(
        customer_code="CUST-1009",
        name="Ben Carter",
        email="ben.carter@outbackmining.com.au",
        phone="+61 2 5550 1987",
        company="Outback Mining Solutions",
        address="88 George St",
        city="Sydney",
        state="NSW",
        country="Australia",
        region="APAC",
        segment=CustomerSegment.ENTERPRISE,
        status=CustomerStatus.ACTIVE,
    ),
    dict(
        customer_code="CUST-1010",
        name="Sofia Moreno",
        email="sofia.moreno@bahiadelmar.mx",
        phone="+52 55 5550 1123",
        company="Bahía del Mar Resorts",
        address="Av. Insurgentes Sur 1200",
        city="Mexico City",
        state="CDMX",
        country="Mexico",
        region="North America",
        segment=CustomerSegment.STANDARD,
        status=CustomerStatus.INACTIVE,
    ),
    dict(
        customer_code="CUST-1011",
        name="Liam O'Connell",
        email="liam.oconnell@greenfieldagritech.ie",
        phone="+353 1 555 0198",
        company="Greenfield AgriTech",
        address="9 Grafton St",
        city="Dublin",
        state=None,
        country="Ireland",
        region="Europe",
        segment=CustomerSegment.NEW,
        status=CustomerStatus.ACTIVE,
    ),
    dict(
        customer_code="CUST-1012",
        name="Grace Mwangi",
        email="grace.mwangi@savannahtelecom.co.ke",
        phone="+254 700 555 123",
        company="Savannah Telecom",
        address="Waiyaki Way 55",
        city="Nairobi",
        state=None,
        country="Kenya",
        region="Africa",
        segment=CustomerSegment.PREMIUM,
        status=CustomerStatus.ACTIVE,
    ),
]


def seed():
    db = SessionLocal()
    try:
        created, skipped = 0, 0
        now = datetime.now(timezone.utc)

        for i, data in enumerate(CUSTOMERS):
            existing = (
                db.query(Customer)
                .filter(Customer.customer_code == data["customer_code"])
                .first()
            )
            if existing:
                skipped += 1
                continue

            customer = Customer(
                **data,
                created_at=now - timedelta(days=(len(CUSTOMERS) - i) * 3),
                updated_at=now - timedelta(days=(len(CUSTOMERS) - i) * 3),
            )
            db.add(customer)
            created += 1

        db.commit()
        print(f"Seed complete: {created} created, {skipped} skipped (already existed).")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
     seed()

