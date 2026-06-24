import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Per-environment API base URLs are surfaced via `extra` and read at runtime
 * through `expo-constants`. NOTHING secret belongs here — this ships in the
 * client bundle. Only public base URLs / non-sensitive flags.
 *
 * Override per environment with APP_ENV=production (or staging) at build time,
 * or point at a LAN dev host with EXPO_PUBLIC_API_HOST.
 */
const APP_ENV = (process.env.APP_ENV ?? 'development') as
  | 'development'
  | 'staging'
  | 'production';

// Host the device can reach. On a physical device localhost won't work — set
// EXPO_PUBLIC_API_HOST to your machine's LAN IP (e.g. 192.168.1.20).
const DEV_HOST = process.env.EXPO_PUBLIC_API_HOST ?? 'localhost';

type ApiConfig = {
  authBaseUrl: string;
  listingBaseUrl: string;
  mediaBaseUrl: string;
  notiBaseUrl: string;
  chatBaseUrl: string;
};

const ENVS: Record<typeof APP_ENV, ApiConfig> = {
  development: {
    authBaseUrl: `http://${DEV_HOST}:8001`,
    mediaBaseUrl: `http://${DEV_HOST}:8002`,
    notiBaseUrl: `http://${DEV_HOST}:8003`,
    listingBaseUrl: `http://${DEV_HOST}:8004`,
    chatBaseUrl: `http://${DEV_HOST}:8006`,
  },
  staging: {
    authBaseUrl: 'https://staging-api.shopoo.example/auth',
    mediaBaseUrl: 'https://staging-api.shopoo.example/media',
    notiBaseUrl: 'https://staging-api.shopoo.example/noti',
    listingBaseUrl: 'https://staging-api.shopoo.example/listing',
    chatBaseUrl: 'https://staging-api.shopoo.example/chat',
  },
  production: {
    authBaseUrl: 'https://api.shopoo.example/auth',
    mediaBaseUrl: 'https://api.shopoo.example/media',
    notiBaseUrl: 'https://api.shopoo.example/noti',
    listingBaseUrl: 'https://api.shopoo.example/listing',
    chatBaseUrl: 'https://api.shopoo.example/chat',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Shopoo',
  slug: 'shopoo-mobile',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'shopoo',
  userInterfaceStyle: 'automatic',
  newArchEnabled: false,
  splash: {
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.shopoo.mobile',
  },
  android: {
    package: 'com.shopoo.mobile',
  },
  plugins: ['expo-secure-store', 'expo-image-picker', 'expo-notifications'],
  extra: {
    appEnv: APP_ENV,
    api: ENVS[APP_ENV],
  },
});
