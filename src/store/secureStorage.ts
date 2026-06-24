import * as SecureStore from 'expo-secure-store';

// The refresh token is a secret and MUST live in the device secure enclave /
// keystore, never in AsyncStorage. Access tokens stay in memory (Zustand).
const REFRESH_TOKEN_KEY = 'shopoo.refresh_token';

export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
