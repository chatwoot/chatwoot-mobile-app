import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAppSelector } from '@/hooks';
import {
  selectHasActiveCall,
  selectIncomingCalls,
  selectIsJoining,
  selectLocalCallSid,
} from '@/store/call/callSelectors';
import { systemCall } from '@/services/voice/systemCall';
import { isNativeCallsAvailable } from '@/services/voice/chatwootCalls';
import { startRingtone, stopRingtone } from '@/utils/ringtone';

import { useAppInFront } from './useAppInFront';

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
  const localCallSid = useAppSelector(selectLocalCallSid);
  // Who rings on Android: the app itself while it is in front, its ring screen and call
  // notification otherwise
  const appInForeground = useAppInFront();
  const platformRings = platformRingsForUs(appInForeground);
  // A ring the OS refused to show rings here instead; a call this device has taken does not
  const shouldRing =
    !hasActiveCall &&
    !isJoining &&
    incomingCalls.some(
      call =>
        call.callDirection === 'inbound' &&
        call.callSid !== localCallSid &&
        (!platformRings || call.systemUiFailed),
    );

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
