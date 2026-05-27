import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@workspace/api-client-react";

const AUTH_STORAGE_KEY = "matr.auth.userId";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((nextUser: User | null) => {
    setUserState(nextUser);
    if (nextUser) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, String(nextUser.id));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const storedId = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedId) {
      setUserState(null);
      setIsLoading(false);
      return;
    }

    try {
      const nextUser = await fetchJson<User>(`/api/users/${storedId}`);
      setUserState(nextUser);
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const nextUser = await fetchJson<User>("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setUser(nextUser);
    return nextUser;
  }, [setUser]);

  const signOut = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signIn,
    signOut,
    setUser,
    refreshUser,
  }), [isLoading, refreshUser, setUser, signIn, signOut, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
