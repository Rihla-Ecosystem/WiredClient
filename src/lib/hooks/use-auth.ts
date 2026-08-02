"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { useAuthStore, type User } from "@/lib/stores/auth-store";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setAuth(data.user as User, data.accessToken);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await authApi.me();
      setUser(data);
      return data;
    },
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: ({ data }) => {
      setUser(data);
    },
  });
}
