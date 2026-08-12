from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.settings import UserSettingsOut, UserSettingsUpdate
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=UserSettingsOut)
def get_my_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the current user's preferences/notification settings,
    creating a default row on first access."""
    return SettingsService(db).get_or_create(current_user.id)


@router.put("", response_model=UserSettingsOut)
def update_my_settings(
    payload: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SettingsService(db).update(current_user.id, payload)
