import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { registerDevice } from '@/api/devices';

// Foreground presentation: show alerts even when the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // iOS 14+ banner/list fields (no-op on Android).
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests permission, obtains the Expo push token (FCM under the hood on
 * Android), and registers it with the Noti Service. STUB: gracefully no-ops on
 * simulators / when permission is denied. Call after login.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse.data;

    await registerDevice({
      token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });

    return token;
  } catch {
    // Push is best-effort; never block the app on it.
    return null;
  }
}

export type PushTapTarget =
  | { kind: 'chat'; conversationId: string }
  | { kind: 'listing'; listingId: string };

// Maps a notification's data payload to an in-app deep-link target.
export function parsePushTarget(
  data: Record<string, unknown> | undefined,
): PushTapTarget | null {
  if (!data) return null;
  if (typeof data.conversationId === 'string') {
    return { kind: 'chat', conversationId: data.conversationId };
  }
  if (typeof data.listingId === 'string') {
    return { kind: 'listing', listingId: data.listingId };
  }
  return null;
}
