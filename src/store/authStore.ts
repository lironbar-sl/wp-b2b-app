import { create } from 'zustand';
import type { AuthSession, User } from '../types';

const SESSION_KEY = 'wp_b2b_session';

interface AuthState {
  session: AuthSession | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setSession: (session: AuthSession | null) => void;
  clearSession: () => void;
  hydrateSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  setSession: (session) => {
    if (typeof window === 'undefined') return;
    try {
      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // localStorage may be unavailable (e.g., private mode with storage blocked)
    }
    set({ session, user: session?.user ?? null });
  },

  clearSession: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {
        // ignore
      }
    }
    set({ session: null, user: null });
  },

  hydrateSession: async () => {
    set({ isLoading: true });
    try {
      if (typeof window === 'undefined') {
        set({ isLoading: false, isInitialized: true });
        return;
      }
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session: AuthSession = JSON.parse(raw);
        const isExpired = new Date(session.expiresAt) <= new Date();
        if (!isExpired) {
          set({ session, user: session.user });
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {
        // ignore
      }
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },
}));

// Selector helpers
export const selectIsAuthenticated = (s: AuthState) => s.session !== null;
export const selectUser = (s: AuthState) => s.user;
export const selectUserRole = (s: AuthState) => s.user?.role ?? null;

// TODO (manager/admin): Add role-check selectors: selectIsManager, selectIsAdmin
