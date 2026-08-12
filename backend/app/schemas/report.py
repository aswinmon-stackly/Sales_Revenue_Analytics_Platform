from pydantic import BaseModel


class StatusCount(BaseModel):
    status: str
    count: int


class CategoryStat(BaseModel):
    category: str
    sales: float
    orders: int


class CustomerStat(BaseModel):
    name: str
    orders: int
    spending: float


class ReportSummary(BaseModel):
    current_revenue: float
    previous_revenue: float
    growth_pct: float
    status_breakdown: list[StatusCount]
    category_breakdown: list[CategoryStat]
    top_customers: list[CustomerStat]
