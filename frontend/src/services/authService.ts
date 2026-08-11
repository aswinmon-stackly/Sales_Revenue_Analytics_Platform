import { apiClient } from "./apiClient";
import type { LoginRequest, LoginResponse, User } from "../types/auth";

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>("/api/auth/login", payload);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>("/api/auth/me");
    return data;
  },
};
