export type SaleStatus = "Completed" | "Processing" | "Pending" | "Cancelled";

export interface Sale {
  id: string;
  customer: string;
  product: string;
  category: string;
  amount: number;
  status: SaleStatus;
  date: string;
}

export interface SaleListParams {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
  page_size?: number;
}

export interface SaleListResponse {
  items: Sale[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  total_revenue: number;
  completed_orders: number;
}

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
}

export interface MonthlyTarget {
  target_amount: number;
  achieved_amount: number;
  achieved_pct: number;
}

export interface DashboardSummary {
  total_revenue: number;
  revenue_change_pct: number;
  total_orders: number;
  orders_change_pct: number;
  total_customers: number;
  customers_change_pct: number;
  growth_pct: number;
  growth_change_pct: number;
  monthly_revenue: MonthlyRevenuePoint[];
  monthly_target: MonthlyTarget;
  recent_orders: Sale[];
}
