import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { connectSocket, disconnectSocket } from '@/realtime/socket';

// Ties the socket lifecycle to auth + AppState: connect after login, disconnect
// on logout, and drop the connection while backgrounded (resync on foreground).
export function useSocketLifecycle(): void {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }

    connectSocket();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        connectSocket();
      } else if (next === 'background') {
        disconnectSocket();
      }
    });

    return () => {
      sub.remove();
      disconnectSocket();
    };
  }, [accessToken]);
}
