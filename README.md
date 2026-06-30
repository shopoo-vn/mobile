# Mobile — Shopoo Marketplace (React Native / Expo)

The consumer app (`mobile/` repo in the `shopoo/` workspace). Built with **Expo + React Native + TypeScript**. Browse and post listings, chat in real time, and receive push — talking to the **Auth / Listing / Media / Chat / Notification** services over REST + Socket.io + FCM.

Plan & conventions: [`../implementation_plan_frontend.md`](../implementation_plan_frontend.md) (§1) · root `CLAUDE.md` · skills `react-native-expo-patterns` + `marketplace-conventions`.

## Screens
- **Auth:** Login, Register
- **Home:** listings feed (infinite scroll, pull-to-refresh)
- **Search:** full-text query + condition + sort
- **ListingDetail:** details + "Chat với người bán"
- **Post:** create a listing (pick images → upload → category → submit)
- **Chat:** conversation list + real-time chat room
- **Profile:** edit name, enable notifications, sign out

State: TanStack Query (server data) + Zustand (auth user, socket status, unread). Access token in memory; refresh token in `expo-secure-store`. One axios instance attaches the token and refreshes once on 401. The socket connects after login (JWT in the handshake) and follows app state.

## Run locally
Requires the backend running (`cd ../backend && docker compose up -d --build`).

```bash
npm install
npx expo start                    # press a (Android) / i (iOS, macOS) / scan the QR with Expo Go
npm run typecheck                 # tsc --noEmit
```

On a **physical device**, point at your machine's LAN IP (localhost won't resolve from the phone):
```bash
# macOS / Git Bash
EXPO_PUBLIC_API_HOST=192.168.1.20 npx expo start
# Windows PowerShell
$env:EXPO_PUBLIC_API_HOST="192.168.1.20"; npx expo start
```

## Configuration
API base URLs come from `app.config.ts` (`extra.api`), read via `expo-constants`. The `development` env points at `http://<DEV_HOST>:<port>` (auth 8001 · media 8002 · noti 8003 · listing 8004 · chat 8006); override the host with `EXPO_PUBLIC_API_HOST`. Nothing secret ships in the bundle.

## Layout
```
App.tsx               providers + bootstrap session + NavigationContainer
src/
  api/                client (axios + refresh), auth, listings, chat, media, devices
  navigation/         RootNavigator (auth gate, tabs, detail stack), types
  screens/            auth/, Home, Search, ListingDetail, CreateListing, Conversations, ChatRoom, Profile
  components/         Screen, Button, TextField, ListingCard, EmptyState, Loading
  store/              authStore, socketStore, secureStorage (Zustand)
  hooks/              useAuth, useListings, useProfile, useChat, useSocketLifecycle
  realtime/           socket.ts (socket.io-client)
  push/               notifications.ts (expo-notifications / FCM)
  types/, theme/, config/, query/
```
