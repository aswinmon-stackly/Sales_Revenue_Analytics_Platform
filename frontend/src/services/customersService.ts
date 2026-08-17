
import { apiClient } from "./apiClient";
import type {
  Customer,
  CustomerInput,
  CustomerListParams,
  CustomerListResponse,
  CustomerStatus,
} from "../types/customer";

export const customersService = {
  async getCustomers(params: CustomerListParams): Promise<CustomerListResponse> {
    const { data } = await apiClient.get<CustomerListResponse>("/api/customers", { params });
    return data;
  },

  async getCustomer(id: number): Promise<Customer> {
    const { data } = await apiClient.get<Customer>(`/api/customers/${id}`);
    return data;
  },

  async createCustomer(payload: CustomerInput): Promise<Customer> {
    const { data } = await apiClient.post<Customer>("/api/customers", payload);
    return data;
  },

  async updateCustomer(id: number, payload: Partial<CustomerInput>): Promise<Customer> {
    const { data } = await apiClient.put<Customer>(`/api/customers/${id}`, payload);
    return data;
  },

  async setStatus(id: number, status: CustomerStatus): Promise<Customer> {
    const { data } = await apiClient.patch<Customer>(`/api/customers/${id}/status`, { status });
    return data;
  },
};