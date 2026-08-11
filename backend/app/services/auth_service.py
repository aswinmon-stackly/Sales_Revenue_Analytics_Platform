from sqlalchemy.orm import Session

from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository


class AuthenticationError(Exception):
    """Raised when credentials are invalid or the account is inactive."""
    pass


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def authenticate(self, email: str, password: str) -> User:
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            # Same error for "no such user" and "wrong password" -
            # never reveal which one it was.
            raise AuthenticationError("Invalid email or password")

        if not user.is_active:
            raise AuthenticationError("Account is inactive")

        return user

    def issue_token(self, user: User) -> str:
        return create_access_token(subject=str(user.id), extra_claims={"role": user.role.value})
