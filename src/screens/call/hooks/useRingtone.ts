import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { useAppSelector } from '@/hooks';
import {
  selectHasActiveCall,
  selectIncomingCalls,
  selectIsJoining,
} from '@/store/call/callSelectors';
import { systemCall } from '@/services/voice/systemCall';
import { isNativeCallsAvailable } from '@/services/voice/chatwootCalls';
import { startRingtone, stopRingtone } from '@/utils/ringtone';

// Whether the agent is looking at the app, which decides who rings on Android: the app
// itself while it is in front, its own ring screen once it is not
const useAppInForeground = () => {
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next =>
      setForeground(next === 'active'),
    );
    return () => subscription.remove();
  }, []);
  return foreground;
};

// iOS rings through the system call UI wherever it is available; Android rings through
// its own screen and call notification, except while the app is the thing in front.
const platformRingsForUs = (appInForeground: boolean) => {
  if (systemCall.isAvailable()) return true;
  return isNativeCallsAvailable() && Platform.OS === 'android' && !appInForeground;
};

// Plays the app's ringtone while an inbound call rings and nothing else is going on. A
// call being answered is past ringing.
export const useRingtone = () => {
  const incomingCalls = useAppSelector(selectIncomingCalls);
  const hasActiveCall = useAppSelector(selectHasActiveCall);
  const isJoining = useAppSelector(selectIsJoining);
  const appInForeground = useAppInForeground();
  const shouldRing =
    !hasActiveCall &&
    !isJoining &&
    !platformRingsForUs(appInForeground) &&
    incomingCalls.some(call => call.callDirection === 'inbound');

  useEffect(() => {
    if (shouldRing) {
      startRingtone().catch(() => {});
    } else {
      stopRingtone().catch(() => {});
    }
    return () => {
      stopRingtone().catch(() => {});
    };
  }, [shouldRing]);
};
