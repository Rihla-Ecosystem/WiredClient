import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  displayName: string;
  gender: "MALE" | "FEMALE" | null;
  nationality: string | null;
  language: string[];
  avatarUrl: string | null;
  bio: string | null;
  xp: number;
  level: number;
  budgetLevel: string | null;
  travelStyle: string | null;
  interests: string[] | null;
  accommodationType: string | null;
  arrivalDate: string | null;
  departureDate: string | null;
  isEmailVerified: boolean;
  role: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true, isLoading: false }),

      setAccessToken: (accessToken) => set({ accessToken }),

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      hydrate: () => {
        const state = get();
        if (state.accessToken) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "rihla-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
