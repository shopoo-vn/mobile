import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { API } from '@/config/env';
import { useAuthStore, getRefreshToken } from '@/store/authStore';
import { TokenPair } from '@/types';

// Each backend lives on its own host/port, so we create one configured axios
// instance per service. They all share the SAME auth interceptor logic (attach
// access token; refresh once on 401 with a shared in-flight queue) so that a
// 401 on any service triggers a single refresh that unblocks every queued
// request across instances.

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ── shared single-flight refresh ──────────────────────────────────────────────
// While a refresh is in progress, concurrent 401s queue here and resolve once
// the new access token arrives (or reject if refresh failed).
let refreshInFlight: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('no refresh token');
  }

  // Use a bare axios call (no interceptors) to avoid recursion.
  const res = await axios.post<TokenPair>(
    `${API.authBaseUrl}/auth/refresh`,
    { refresh_token: refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const pair = res.data;
  useAuthStore.getState().setAccessToken(pair.access_token);
  // Refresh tokens rotate on use — persist the new one.
  await useAuthStore.getState().setSession({
    user: useAuthStore.getState().user!,
    accessToken: pair.access_token,
    refreshToken: pair.refresh_token,
  });
  return pair.access_token;
}

function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function attachInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as RetriableConfig | undefined;
      const status = error.response?.status;

      // Only attempt a refresh for genuine auth failures, once per request, and
      // never for the refresh endpoint itself.
      const isRefreshCall =
        original?.url?.includes('/auth/refresh') ?? false;

      if (status === 401 && original && !original._retry && !isRefreshCall) {
        original._retry = true;
        try {
          const newToken = await refreshAccessToken();
          original.headers.set('Authorization', `Bearer ${newToken}`);
          return instance(original);
        } catch {
          // Refresh failed → session is dead. Log out and let the error surface
          // so the UI bounces back to the AuthStack.
          await useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

function createInstance(baseURL: string): AxiosInstance {
  return attachInterceptors(
    axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

export const authClient = createInstance(API.authBaseUrl);
export const listingClient = createInstance(API.listingBaseUrl);
export const mediaClient = createInstance(API.mediaBaseUrl);
export const notiClient = createInstance(API.notiBaseUrl);
export const chatClient = createInstance(API.chatBaseUrl);

// Normalise the backend `{ error }` shape into a plain message for the UI.
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
