from sqlalchemy.orm import Session

from app.models.user_settings import UserSettings
from app.repositories.settings_repository import SettingsRepository
from app.schemas.settings import UserSettingsUpdate


class SettingsService:
    def __init__(self, db: Session):
        self.repo = SettingsRepository(db)

    def get_or_create(self, user_id: int) -> UserSettings:
        row = self.repo.get_by_user_id(user_id)
        if row is None:
            row = self.repo.create_default(user_id)
        return row

    def update(self, user_id: int, payload: UserSettingsUpdate) -> UserSettings:
        row = self.get_or_create(user_id)
        updates = payload.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(row, field, value)
        return self.repo.save(row)
