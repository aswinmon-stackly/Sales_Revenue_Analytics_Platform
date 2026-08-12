from sqlalchemy.orm import Session

from app.models.user_settings import UserSettings


class SettingsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: int) -> UserSettings | None:
        return self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

    def create_default(self, user_id: int) -> UserSettings:
        row = UserSettings(user_id=user_id)
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def save(self, row: UserSettings) -> UserSettings:
        self.db.commit()
        self.db.refresh(row)
        return row
