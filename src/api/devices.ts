import { notiClient } from './client';

export interface RegisterDevicePayload {
  // Expo/FCM push token.
  token: string;
  platform: 'ios' | 'android';
}

// Registers this device's push token with the Noti Service so the backend can
// target it. Re-call whenever the token changes.
export async function registerDevice(
  payload: RegisterDevicePayload,
): Promise<void> {
  await notiClient.post('/devices', payload);
}
