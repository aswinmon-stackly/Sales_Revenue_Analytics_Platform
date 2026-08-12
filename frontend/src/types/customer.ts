export type CustomerStatus = "Active" | "Inactive";

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  orders: number;
  total_spent: number;
  status: CustomerStatus;
  joined_date: string;
}

export interface CustomerListParams {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CustomerSummary {
  total_customers: number;
  active_customers: number;
  total_revenue: number;
}
