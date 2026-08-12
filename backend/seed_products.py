"""
Creates the `categories` and `products` tables (if not present) and seeds a
small realistic catalog. Run from backend/ via:

    python seed_products.py

Local development seed data only - not meant for production use.
"""
from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.models.category import Category, CategoryStatus
from app.models.product import Product, ProductStatus
from app.models.user import User  # noqa: F401 - ensures Base.metadata knows about all tables
from app.models.sale import Sale  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.user_settings import UserSettings  # noqa: F401

CATEGORIES = [
    ("Software", "Licensed and subscription software products"),
    ("Electronics", "Hardware, devices, and accessories"),
    ("Services", "Consulting, support, and cloud services"),
]

# (name, sku, category_name, price, cost, stock_quantity, status)
PRODUCTS = [
    ("Enterprise Suite License", "SW-ENT-001", "Software", 4999.00, 2500.00, 40, ProductStatus.ACTIVE),
    ("Analytics Platform (Annual)", "SW-ANLYT-002", "Software", 2999.00, 1200.00, 60, ProductStatus.ACTIVE),
    ("CRM Subscription", "SW-CRM-003", "Software", 1499.00, 600.00, 8, ProductStatus.ACTIVE),
    ("Developer Toolkit", "SW-DEV-004", "Software", 799.00, 300.00, 0, ProductStatus.ACTIVE),
    ("Laptop Pro 14", "EL-LAP-001", "Electronics", 89999.00, 65000.00, 15, ProductStatus.ACTIVE),
    ("Wireless Mouse", "EL-MOU-002", "Electronics", 1299.00, 550.00, 120, ProductStatus.ACTIVE),
    ("Networking Switch 24-Port", "EL-NET-003", "Electronics", 15999.00, 9000.00, 5, ProductStatus.ACTIVE),
    ("Cloud Migration Package", "SV-CLD-001", "Services", 49999.00, 20000.00, 999, ProductStatus.ACTIVE),
    ("Priority Support Retainer", "SV-SUP-002", "Services", 9999.00, 3000.00, 999, ProductStatus.ACTIVE),
    ("Legacy Reporting Tool", "SW-LEG-005", "Software", 499.00, 200.00, 3, ProductStatus.DISCONTINUED),
]


def run():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Category).count() > 0 or db.query(Product).count() > 0:
            print("Categories/products already seeded - skipping. "
                  "Delete existing rows first if you want to reseed.")
            return

        categories_by_name = {}
        for name, description in CATEGORIES:
            category = Category(name=name, description=description, status=CategoryStatus.ACTIVE)
            db.add(category)
            categories_by_name[name] = category
        db.flush()  # assigns IDs without committing yet

        for name, sku, category_name, price, cost, qty, status in PRODUCTS:
            db.add(
                Product(
                    name=name,
                    sku=sku,
                    category_id=categories_by_name[category_name].id,
                    price=price,
                    cost=cost,
                    stock_quantity=qty,
                    status=status,
                )
            )

        db.commit()
        print(f"Seeded {len(CATEGORIES)} categories and {len(PRODUCTS)} products.")
    finally:
        db.close()


if __name__ == "__main__":
    run()