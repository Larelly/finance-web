"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, clearTokens, isAuthenticated } from "./api";

const USER_KEY = "finance.user";

interface SessionUser {
  email: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, timezone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      const stored = window.localStorage.getItem(USER_KEY);
      setUser(stored ? (JSON.parse(stored) as SessionUser) : null);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await authApi.login({ email, password });
    const sessionUser = { email };
    window.localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  }, []);

  const register = useCallback(async (email: string, password: string, timezone: string) => {
    await authApi.register({ email, password, timezone });
    await authApi.login({ email, password });
    const sessionUser = { email };
    window.localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function clearSession(): void {
  clearTokens();
  window.localStorage.removeItem(USER_KEY);
}
