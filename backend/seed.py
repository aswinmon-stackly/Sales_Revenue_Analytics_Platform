"""
Creates the users table (if not present) and seeds one test user per role.

Run from the backend/ directory, with your virtualenv active and .env
configured, via:

    python seed.py

Local development credentials only - do NOT reuse these in production.
"""
from app.core.security import hash_password
from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.models.user import User, UserRole

SEED_USERS = [
    {"name": "Admin User", "email": "admin@example.com", "password": "Admin@123", "role": UserRole.ADMIN},
    {"name": "Analyst User", "email": "analyst@example.com", "password": "Analyst@123", "role": UserRole.ANALYST},
    {"name": "Viewer User", "email": "viewer@example.com", "password": "Viewer@123", "role": UserRole.VIEWER},
]


def run():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for entry in SEED_USERS:
            existing = db.query(User).filter(User.email == entry["email"]).first()
            if existing:
                print(f"Skipping {entry['email']} (already exists)")
                continue

            user = User(
                name=entry["name"],
                email=entry["email"],
                password_hash=hash_password(entry["password"]),
                role=entry["role"],
                is_active=True,
            )
            db.add(user)
            print(f"Created {entry['role'].value} user: {entry['email']}")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
