from pydantic import BaseModel, ConfigDict

from app.models.customer import CustomerStatus


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str  # e.g. "CUS-1001"
    name: str
    email: str
    company: str
    orders: int
    total_spent: float
    status: CustomerStatus
    joined_date: str  # pre-formatted, e.g. "02 Jan 2026"


class CustomerListResponse(BaseModel):
    items: list[CustomerOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class CustomerSummary(BaseModel):
    total_customers: int
    active_customers: int
    total_revenue: float
