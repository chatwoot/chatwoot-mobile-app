import { useEffect } from 'react';

import { useAppSelector } from '@/hooks';
import {
  selectHasActiveCall,
  selectIncomingCalls,
  selectIsJoining,
} from '@/store/call/callSelectors';
import { systemCall } from '@/services/voice/systemCall';
import { startRingtone, stopRingtone } from '@/utils/ringtone';

// Plays the app's ringtone while an inbound call rings and nothing else is going on. The
// OS rings on its own when the system call UI is in use, and a call being answered from
// the native screen is past ringing.
export const useRingtone = () => {
  const incomingCalls = useAppSelector(selectIncomingCalls);
  const hasActiveCall = useAppSelector(selectHasActiveCall);
  const isJoining = useAppSelector(selectIsJoining);
  const shouldRing =
    !hasActiveCall &&
    !isJoining &&
    !systemCall.isAvailable() &&
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
