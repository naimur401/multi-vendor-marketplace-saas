import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'admin';
  tenantId?: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isVendor: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => get().token !== null,
      isVendor: () => get().user?.role === 'vendor',
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
