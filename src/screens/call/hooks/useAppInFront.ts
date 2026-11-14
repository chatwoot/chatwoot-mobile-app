import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { isAppInForeground } from '@/services/voice/chatwootCalls';

const inFront = () => AppState.currentState === 'active' && isAppInForeground();

// Lock-screen activities also report active AppState.
export const useAppInFront = () => {
  const [front, setFront] = useState(inFront);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', () => setFront(inFront()));
    return () => subscription.remove();
  }, []);
  return front;
};
