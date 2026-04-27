import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  hydrated: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setHydrated: () => set({ hydrated: true }),
}));
