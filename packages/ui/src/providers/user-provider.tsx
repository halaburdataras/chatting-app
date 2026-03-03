"use client";
import { UserModel } from "@repo/shared";
import { apiClient, getCurrentUser } from "@repo/shared/lib/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching user",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    apiClient.removeAuthToken();
    setUser(null);
    setLoading(false);
    setError(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchUser();
    }
  }, [fetchUser]);

  const values = useMemo(
    () => ({
      user,
      loading,
      error,
      setUser,
      setLoading,
      setError,
      fetchUser,
      logout,
    }),
    [user, loading, error, fetchUser, logout],
  );

  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
}

const UserContext = createContext<{
  user: UserModel | null;
  loading: boolean;
  error: string | null;
  setUser: (user: UserModel) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  loading: false,
  error: null,
  setUser: () => {},
  setLoading: () => {},
  setError: () => {},
  fetchUser: async () => {},
  logout: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}
