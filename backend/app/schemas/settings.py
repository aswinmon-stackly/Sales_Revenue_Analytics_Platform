from pydantic import BaseModel, ConfigDict


class UserSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    default_page_size: int
    default_sort_field: str
    default_sort_order: str
    currency: str
    email_notifications: bool
    weekly_summary_email: bool
    low_stock_alerts: bool


class UserSettingsUpdate(BaseModel):
    default_page_size: int | None = None
    default_sort_field: str | None = None
    default_sort_order: str | None = None
    currency: str | None = None
    email_notifications: bool | None = None
    weekly_summary_email: bool | None = None
    low_stock_alerts: bool | None = None
