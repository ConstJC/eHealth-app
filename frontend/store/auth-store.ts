import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { tokenStorage } from '@/lib/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null; // Stored in memory, not persisted
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null, // In-memory, not persisted
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      setUser: (user) => {
        if (user) {
          tokenStorage.setUser(user);
        }
        // Check if we have access token to determine auth status
        const accessToken = get().accessToken || tokenStorage.getAccessToken();
        const isAuthenticated = !!(user && accessToken);
        set({ user, isAuthenticated });
      },
      setAccessToken: (accessToken) => {
        // Store in both Zustand state and tokenStorage memory
        tokenStorage.setAccessToken(accessToken);
        const currentUser = get().user || tokenStorage.getUser();
        const isAuthenticated = !!(currentUser && accessToken);
        set({ accessToken, isAuthenticated });
      },
      logout: () => {
        tokenStorage.clear();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // Only persist user, not tokens
      onRehydrateStorage: () => (state) => {
        // After rehydration, restore user but not tokens
        // Access token will be fetched on first API call if needed
        if (state && typeof window !== 'undefined') {
          const user = state.user || tokenStorage.getUser();
          
          // Don't set isAuthenticated here - it will be set when access token is available
          state.user = user;
          state.accessToken = null; // Access token not persisted
          state.isAuthenticated = false; // Will be set when token is available
          state.hasHydrated = true;
        } else if (state) {
          // Server-side: mark as hydrated but not authenticated
          state.hasHydrated = true;
        }
      },
    }
  )
);

