export type ProductStatus = "Active" | "Inactive" | "Discontinued";
export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  category_id: number;
  category_name: string;
  price: number;
  cost: number;
  stock_quantity: number;
  stock_status: StockStatus;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductListParams {
  search?: string;
  category?: number;
  status?: string;
  stockStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProductListResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductInput {
  name: string;
  sku: string;
  description?: string | null;
  category_id: number;
  price: number;
  cost: number;
  stock_quantity: number;
  status: ProductStatus;
}