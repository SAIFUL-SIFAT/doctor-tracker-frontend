"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await apiClient<{ data: { user: User } }>("/api/v1/auth/me");
        return res.data.user;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient("/api/v1/auth/logout", { method: "POST" });
    },
    onSettled: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  const logout = React.useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return (
    <AuthContext.Provider
      value={{
        user: data || null,
        isLoading,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
