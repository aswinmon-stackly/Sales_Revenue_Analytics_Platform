export type CustomerStatus = "ACTIVE" | "INACTIVE";
export type CustomerSegment = "Enterprise" | "Premium" | "Standard" | "New" | "At Risk";

export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  region: string | null;
  segment: CustomerSegment;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface CustomerListParams {
  search?: string;
  segment?: string;
  region?: string;
  status?: string;
  country?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CustomerListResponse {
  data: Customer[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerInput {
  customer_code: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  region?: string | null;
  segment: CustomerSegment;
  status?: CustomerStatus;
}