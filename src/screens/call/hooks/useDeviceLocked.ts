import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { isDeviceLocked } from '@/services/voice/chatwootCalls';

const POLL_INTERVAL_MS = 1_000;

// Whether the phone is still locked. A call screen shown over the lock screen must not
// offer a way into the rest of the app, so it watches this until the agent unlocks.
export const useDeviceLocked = () => {
  const [locked, setLocked] = useState(() => Platform.OS === 'android' && isDeviceLocked());

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const check = () => setLocked(isDeviceLocked());
    check();
    const timer = setInterval(check, POLL_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', check);
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);

  return locked;
};
