import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { tokenStorage } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      setUser: (user) => {
        if (user) {
          tokenStorage.setUser(user);
        }
        // Check if we have tokens to determine auth status
        const accessToken = tokenStorage.getAccessToken();
        const isAuthenticated = !!(user && accessToken);
        set({ user, isAuthenticated });
      },
      setTokens: (accessToken, refreshToken) => {
        tokenStorage.setAccessToken(accessToken);
        tokenStorage.setRefreshToken(refreshToken);
        // Update isAuthenticated if we have tokens
        // Check both current user in store and in localStorage
        const currentUser = get().user || tokenStorage.getUser();
        if (currentUser && accessToken) {
          set({ isAuthenticated: true });
        }
      },
      logout: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check if we have tokens and user
        if (state && typeof window !== 'undefined') {
          const accessToken = tokenStorage.getAccessToken();
          const user = state.user || tokenStorage.getUser();
          
          // Set authentication status based on both user and token
          const isAuthenticated = !!(user && accessToken);
          
          state.user = user;
          state.isAuthenticated = isAuthenticated;
          state.hasHydrated = true;
        } else if (state) {
          // Server-side: mark as hydrated but not authenticated
          state.hasHydrated = true;
        }
      },
    }
  )
);

