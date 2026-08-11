import axios, { AxiosError } from "axios";
import { STORAGE_KEYS } from "../constants/routes";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!BASE_URL) {
  // Fail loudly in development rather than silently calling the wrong host.
  console.warn(
    "VITE_API_BASE_URL is not set. Add it to your .env file, e.g. VITE_API_BASE_URL=http://localhost:8000"
  );
}

export const apiClient = axios.create({
  baseURL: BASE_URL ?? "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if present) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors and handle global 401s (expired/invalid session).
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      // Avoid redirect loops if we're already on the login page.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly message from any Axios/network error,
 * so raw backend errors are never shown directly to the user.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;

    if (!error.response) {
      return "Network error. Please check your connection and try again.";
    }
    if (status === 400) return detail ?? "The request was invalid. Please check your input.";
    if (status === 401) return detail ?? "Invalid email or password.";
    if (status === 403) return detail ?? "You do not have permission to do that.";
    if (status === 500) return "Something went wrong on our end. Please try again shortly.";
    return detail ?? "Something went wrong. Please try again.";
  }
  return "An unexpected error occurred. Please try again.";
}
