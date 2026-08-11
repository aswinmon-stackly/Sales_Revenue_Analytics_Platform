from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token, InvalidTokenError
from app.database.session import get_db
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository

# tokenUrl is just used for OpenAPI docs' "Authorize" button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extracts and validates the JWT from the Authorization header, then loads
    the corresponding user from the DB. Raises 401 for any missing/invalid/
    expired token or unknown/inactive user.
    """
    if token is None:
        raise _credentials_exception

    try:
        payload = decode_access_token(token)
    except InvalidTokenError:
        raise _credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise _credentials_exception

    user = UserRepository(db).get_by_id(int(user_id))
    if user is None or not user.is_active:
        raise _credentials_exception

    return user


def require_authenticated_user() -> type:
    """Alias dependency - any valid, active, logged-in user."""
    return get_current_user


def require_roles(*allowed_roles: UserRole):
    """
    Factory that returns a dependency enforcing the current user's role is
    one of `allowed_roles`. Returns 403 (not 401) since the user IS
    authenticated, just not authorized for this resource.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_roles(UserRole.ADMIN))])
    """
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency


# Convenience pre-built dependencies matching the spec's naming
def require_admin():
    return require_roles(UserRole.ADMIN)


def require_analyst():
    return require_roles(UserRole.ADMIN, UserRole.ANALYST)
