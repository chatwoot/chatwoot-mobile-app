import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { isAppInForeground } from '@/services/voice/chatwootCalls';

const inFront = () => AppState.currentState === 'active' && isAppInForeground();

// Whether the agent is looking at the app itself. On Android the lock-screen call screen
// runs the app's views too, which makes the app state active, so the native side is asked
// as well; it does not count that screen.
export const useAppInFront = () => {
  const [front, setFront] = useState(inFront);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', () => setFront(inFront()));
    return () => subscription.remove();
  }, []);
  return front;
};
