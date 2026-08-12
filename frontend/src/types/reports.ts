export interface TopCustomer {
  customer: string;
  revenue: number;
  orders: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueThisMonth {
  revenue: number;
  orders: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

export interface RevenueByCategoryMonth {
  month: string;
  categories: CategoryRevenue[];
}

export interface ReportsResponse {
  top_customers: TopCustomer[];
  status_breakdown: StatusBreakdown[];
  revenue_this_month: RevenueThisMonth;
  revenue_by_category_month_over_month: RevenueByCategoryMonth[];
}