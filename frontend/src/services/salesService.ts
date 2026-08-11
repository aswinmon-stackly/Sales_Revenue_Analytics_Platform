import { apiClient } from "./apiClient";
import type { DashboardSummary, SaleListParams, SaleListResponse } from "../types/sales";

export const salesService = {
  async getSales(params: SaleListParams): Promise<SaleListResponse> {
    const { data } = await apiClient.get<SaleListResponse>("/api/sales", { params });
    return data;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const { data } = await apiClient.get<DashboardSummary>("/api/dashboard/summary");
    return data;
  },
};
