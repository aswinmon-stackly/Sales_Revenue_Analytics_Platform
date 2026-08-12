from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.put("/me", response_model=UserOut)
def update_my_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates the current user's own display name and/or email. Password
    and role are intentionally not editable here - unrelated to auth."""
    repo = UserRepository(db)

    if payload.email and payload.email != current_user.email:
        existing = repo.get_by_email(payload.email)
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="That email is already in use.",
            )

    updated = repo.update(current_user, name=payload.name, email=payload.email)
    return updated
