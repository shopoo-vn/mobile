import Constants from 'expo-constants';

type ApiConfig = {
  authBaseUrl: string;
  listingBaseUrl: string;
  mediaBaseUrl: string;
  notiBaseUrl: string;
  chatBaseUrl: string;
};

type Extra = {
  appEnv: 'development' | 'staging' | 'production';
  api: ApiConfig;
};

// expo-constants surfaces the `extra` block from app.config.ts. We validate it
// once at startup and fail fast if anything required is missing, so the rest of
// the app can treat config as guaranteed-present.
function readExtra(): Extra {
  const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;
  const api = extra.api;

  if (!api) {
    throw new Error('Missing `extra.api` config — check app.config.ts');
  }

  const required: (keyof ApiConfig)[] = [
    'authBaseUrl',
    'listingBaseUrl',
    'mediaBaseUrl',
    'notiBaseUrl',
    'chatBaseUrl',
  ];
  for (const key of required) {
    if (!api[key]) {
      throw new Error(`Missing required API base URL: extra.api.${key}`);
    }
  }

  return {
    appEnv: extra.appEnv ?? 'development',
    api: api as ApiConfig,
  };
}

const env = readExtra();

export const APP_ENV = env.appEnv;
export const API = env.api;
