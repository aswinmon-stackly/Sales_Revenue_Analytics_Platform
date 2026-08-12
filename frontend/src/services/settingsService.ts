import { apiClient } from "./apiClient";
import type { UserSettings, UserSettingsUpdate } from "../types/settings";
import type { User } from "../types/auth";

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const { data } = await apiClient.get<UserSettings>("/api/settings");
    return data;
  },

  async updateSettings(payload: UserSettingsUpdate): Promise<UserSettings> {
    const { data } = await apiClient.put<UserSettings>("/api/settings", payload);
    return data;
  },
};

export const usersService = {
  async updateProfile(payload: { name?: string; email?: string }): Promise<User> {
    const { data } = await apiClient.put<User>("/api/users/me", payload);
    return data;
  },
};
