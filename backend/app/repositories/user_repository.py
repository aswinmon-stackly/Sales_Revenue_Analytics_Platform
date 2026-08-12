from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Encapsulates all direct DB access for the User model."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, *, name: str | None = None, email: str | None = None) -> User:
        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        self.db.commit()
        self.db.refresh(user)
        return user
