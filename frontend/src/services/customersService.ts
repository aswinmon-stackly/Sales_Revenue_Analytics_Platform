import { apiClient } from "./apiClient";
import type { CustomerListParams, CustomerListResponse, CustomerSummary } from "../types/customer";

export const customersService = {
  async getCustomers(params: CustomerListParams): Promise<CustomerListResponse> {
    const { data } = await apiClient.get<CustomerListResponse>("/api/customers", { params });
    return data;
  },

  async getCustomerSummary(): Promise<CustomerSummary> {
    const { data } = await apiClient.get<CustomerSummary>("/api/customers/summary");
    return data;
  },
};
