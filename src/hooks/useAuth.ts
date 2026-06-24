import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as authApi from '@/api/auth';
import { useAuthStore, getRefreshToken } from '@/store/authStore';
import { getMe } from '@/api/auth';

// Restores a session on cold start: if a refresh token is in SecureStore, mint
// a fresh access token and load the profile. Marks bootstrap complete either
// way so the navigator can decide Auth vs Main.
export function useBootstrapSession(): void {
  const { setSession, setUser, setBootstrapped, logout } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) return;
        const pair = await authApi.refresh(refreshToken);
        if (cancelled) return;
        useAuthStore.getState().setAccessToken(pair.access_token);
        const me = await getMe();
        if (cancelled) return;
        setUser(me);
        await setSession({
          user: me,
          accessToken: pair.access_token,
          refreshToken: pair.refresh_token,
        });
      } catch {
        await logout();
      } finally {
        if (!cancelled) setBootstrapped();
      }
    })();
    return () => {
      cancelled = true;
    };
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (vars: { email: string; password: string }) =>
      authApi.login(vars.email, vars.password),
    onSuccess: async (data) => {
      await setSession({
        user: data.user,
        accessToken: data.tokens.access_token,
        refreshToken: data.tokens.refresh_token,
      });
    },
  });
}

export function useRegister() {
  const login = useLogin();
  return useMutation({
    mutationFn: async (vars: authApi.RegisterPayload) => {
      await authApi.register(vars);
      // Auto-login after a successful registration.
      return login.mutateAsync({ email: vars.email, password: vars.password });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  return useCallback(async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Best-effort server-side revoke; clear locally regardless.
      }
    }
    await logout();
  }, [logout]);
}
