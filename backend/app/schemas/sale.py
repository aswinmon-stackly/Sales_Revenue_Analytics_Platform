from pydantic import BaseModel, ConfigDict, Field

from app.models.sale import SaleStatus


class SaleOut(BaseModel):
    """
    Shaped to match the frontend's existing `Sale` interface field-for-field
    (id/customer/product/category/amount/status/date) so the Sales and
    Dashboard pages need minimal changes when switching from mock data.
    """

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Human-readable order number, e.g. 'ORD-1001'")
    customer: str
    product: str
    category: str
    amount: float
    status: SaleStatus
    date: str = Field(..., description="Pre-formatted display date, e.g. '11 Aug 2026'")


class SaleListResponse(BaseModel):
    """
    Response for GET /api/sales. Carries pagination info plus aggregate
    totals for the *currently filtered* result set, so the Sales page can
    render its summary cards (Total Sales / Total Revenue / Completed
    Orders) without a second round-trip.
    """

    items: list[SaleOut]
    total: int
    page: int
    page_size: int
    total_pages: int
    total_revenue: float
    completed_orders: int


class MonthlyRevenuePoint(BaseModel):
    month: str  # e.g. "Jan"
    revenue: float


class MonthlyTarget(BaseModel):
    target_amount: float
    achieved_amount: float
    achieved_pct: float


class DashboardSummary(BaseModel):
    total_revenue: float
    revenue_change_pct: float

    total_orders: int
    orders_change_pct: float

    total_customers: int
    customers_change_pct: float

    growth_pct: float
    growth_change_pct: float

    monthly_revenue: list[MonthlyRevenuePoint]
    monthly_target: MonthlyTarget
    recent_orders: list[SaleOut]
