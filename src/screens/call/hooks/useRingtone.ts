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

const platformRingsForUs = (appInForeground: boolean) => {
  if (systemCall.isAvailable()) return true;
  return isNativeCallsAvailable() && Platform.OS === 'android' && !appInForeground;
};

export const useRingtone = () => {
  const incomingCalls = useAppSelector(selectIncomingCalls);
  const hasActiveCall = useAppSelector(selectHasActiveCall);
  const isJoining = useAppSelector(selectIsJoining);
  const localCallSid = useAppSelector(selectLocalCallSid);
  const appInForeground = useAppInFront();
  const platformRings = platformRingsForUs(appInForeground);
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
