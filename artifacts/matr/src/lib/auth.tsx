import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useClerk, useUser as useClerkUser } from "@clerk/react";
import type { User } from "@workspace/api-client-react";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

type ClerkSyncBody = {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
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

function buildSyncBody(clerkUser: NonNullable<ReturnType<typeof useClerkUser>["user"]>): ClerkSyncBody | null {
  const email = clerkUser.primaryEmailAddress?.emailAddress?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  return {
    clerkId: clerkUser.id,
    email,
    firstName: clerkUser.firstName?.trim() || clerkUser.username?.trim() || "MATR",
    lastName: clerkUser.lastName?.trim() || "Member",
    profilePhotoUrl: clerkUser.imageUrl ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user: clerkUser } = useClerkUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const payload = buildSyncBody(clerkUser);

    if (!payload) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const nextUser = await fetchJson<User>("/api/auth/clerk-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  }, [clerkUser, isLoaded, isSignedIn]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    setUser(null);
    await clerk.signOut();
  }, [clerk]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signOut,
    refreshUser,
  }), [isLoading, refreshUser, signOut, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
