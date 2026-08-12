export interface StatusCount {
  status: string;
  count: number;
}

export interface CategoryStat {
  category: string;
  sales: number;
  orders: number;
}

export interface CustomerStat {
  name: string;
  orders: number;
  spending: number;
}

export interface ReportSummary {
  current_revenue: number;
  previous_revenue: number;
  growth_pct: number;
  status_breakdown: StatusCount[];
  category_breakdown: CategoryStat[];
  top_customers: CustomerStat[];
}
