import { create } from 'zustand';
import { User } from '@/types';
import {
  clearRefreshToken,
  getRefreshToken,
  saveRefreshToken,
} from './secureStorage';

interface AuthState {
  // Access token lives in memory only — never persisted.
  accessToken: string | null;
  user: User | null;
  // True until we've checked SecureStore for an existing session on launch.
  bootstrapping: boolean;

  isAuthenticated: () => boolean;
  setSession: (params: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setBootstrapped: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  bootstrapping: true,

  isAuthenticated: () => Boolean(get().accessToken),

  setSession: async ({ user, accessToken, refreshToken }) => {
    await saveRefreshToken(refreshToken);
    set({ user, accessToken });
  },

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user }),

  setBootstrapped: () => set({ bootstrapping: false }),

  logout: async () => {
    await clearRefreshToken();
    set({ accessToken: null, user: null });
  },
}));

// Re-exported for convenience to consumers that only need the persisted token.
export { getRefreshToken };
