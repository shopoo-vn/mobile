import { authClient } from './client';
import { LoginResponse, TokenPair, User } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  display_name: string;
  phone?: string;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await authClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  return res.data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  // Auth service returns the created user (201). Caller logs in afterwards.
  const res = await authClient.post<User>('/auth/register', payload);
  return res.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await authClient.post('/auth/logout', { refresh_token: refreshToken });
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  const res = await authClient.post<TokenPair>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await authClient.get<User>('/users/me');
  return res.data;
}

export interface UpdateMePayload {
  display_name: string;
  avatar_url?: string | null;
}

export async function updateMe(payload: UpdateMePayload): Promise<User> {
  const res = await authClient.patch<User>('/users/me', payload);
  return res.data;
}
