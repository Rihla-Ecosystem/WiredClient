import { coreClient } from "./client";
import type { User } from "@/lib/stores/auth-store";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
}

export interface RegisterPayload {
  display_name: string;
  email: string;
  password: string;
  gender?: "MALE" | "FEMALE" | null;
  nationality?: string | null;
  language?: string[];
  budget_level?: string | null;
  travel_style?: string | null;
  interests?: string[] | null;
  accommodation_type?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    coreClient.post<LoginResponse>("/auth/login", data),

  register: (data: RegisterPayload) =>
    coreClient.post<{ user: Partial<User> }>("/auth/register", data),

  forgotPassword: (data: { email: string }) =>
    coreClient.post("/auth/forgot-password", data),

  resetPassword: (data: { password: string; token: string }) =>
    coreClient.post("/auth/reset-password", data),

  me: () => coreClient.get<User>("/users/me"),

  updateProfile: (data: Partial<User>) =>
    coreClient.patch<User>("/users/me", data),

  getBadges: (userId: string) =>
    coreClient.get<
      { id: number; name: string; description?: string | null; iconUrl?: string | null }[]
    >(`/users/${userId}/badges`),

  verifyEmail: (token: string) =>
    coreClient.get<{ message: string }>("/auth/verify-email", {
      params: { token },
    }),

  resendVerification: (email: string) =>
    coreClient.post<{ message: string }>("/auth/resend-verification", { email }),
};
