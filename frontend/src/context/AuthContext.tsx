import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/authService";
import { STORAGE_KEYS } from "../constants/routes";
import type { User, UserRole } from "../types/auth";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  );
  const [status, setStatus] = useState<AuthStatus>("idle");

  // On mount, if a token exists, validate it against /api/auth/me
  // and hydrate the user rather than trusting the stored token blindly.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!token) {
        setStatus("unauthenticated");
        return;
      }
      setStatus("loading");
      try {
        const currentUser = await authService.getCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          setToken(null);
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      role: user?.role ?? null,
      status,
      isAuthenticated: status === "authenticated",
      login,
      logout,
    }),
    [user, token, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
