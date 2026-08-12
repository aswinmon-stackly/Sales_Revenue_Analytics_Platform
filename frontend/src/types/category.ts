export type CategoryStatus = "Active" | "Inactive";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  status: CategoryStatus;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CategoryListResponse {
  data: Category[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategoryInput {
  name: string;
  description?: string | null;
  status: CategoryStatus;
}