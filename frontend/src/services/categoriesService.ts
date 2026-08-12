import { apiClient } from "./apiClient";
import type { Category, CategoryInput, CategoryListParams, CategoryListResponse } from "../types/category";

export const categoriesService = {
  async getCategories(params: CategoryListParams): Promise<CategoryListResponse> {
    const { data } = await apiClient.get<CategoryListResponse>("/api/categories", { params });
    return data;
  },

  async getAllForDropdown(): Promise<Category[]> {
    // Used to populate the Product form's category <Select> - one page is
    // plenty since category counts are small; avoids a second list shape.
    const { data } = await apiClient.get<CategoryListResponse>("/api/categories", {
      params: { limit: 100, sortBy: "name", sortOrder: "asc" },
    });
    return data.data;
  },

  async createCategory(payload: CategoryInput): Promise<Category> {
    const { data } = await apiClient.post<Category>("/api/categories", payload);
    return data;
  },

  async updateCategory(id: number, payload: Partial<CategoryInput>): Promise<Category> {
    const { data } = await apiClient.put<Category>(`/api/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/api/categories/${id}`);
  },
};