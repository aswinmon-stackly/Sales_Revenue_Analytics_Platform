import { apiClient } from "./apiClient";
import type { Product, ProductInput, ProductListParams, ProductListResponse } from "../types/product";

export const productsService = {
  async getProducts(params: ProductListParams): Promise<ProductListResponse> {
    const { data } = await apiClient.get<ProductListResponse>("/api/products", { params });
    return data;
  },

  async createProduct(payload: ProductInput): Promise<Product> {
    const { data } = await apiClient.post<Product>("/api/products", payload);
    return data;
  },

  async updateProduct(id: number, payload: Partial<ProductInput>): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/api/products/${id}`, payload);
    return data;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/api/products/${id}`);
  },
};