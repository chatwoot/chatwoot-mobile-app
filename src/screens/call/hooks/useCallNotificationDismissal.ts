import { useEffect, useRef } from 'react';

import { useAppSelector } from '@/hooks';
import { selectHasActiveCall, selectIncomingCalls } from '@/store/call/callSelectors';
import { cancelCallNotification } from '@/utils/callNotifications';

import { useAppInFront } from './useAppInFront';

export const useCallNotificationDismissal = () => {
  const incomingCalls = useAppSelector(selectIncomingCalls);
  const incomingCount = incomingCalls.length;
  const ringingSids = incomingCalls
    .filter(call => call.callDirection === 'inbound')
    .map(call => call.callSid)
    .join(',');
  const hasActiveCall = useAppSelector(selectHasActiveCall);
  const appInFront = useAppInFront();
  const hadCallRef = useRef(false);

  useEffect(() => {
    if (!appInFront) return;
    if (incomingCount || hasActiveCall) {
      hadCallRef.current = true;
      cancelCallNotification(ringingSids ? ringingSids.split(',') : []);
      return;
    }
    if (hadCallRef.current) {
      hadCallRef.current = false;
      cancelCallNotification();
    }
  }, [appInFront, incomingCount, hasActiveCall, ringingSids]);
};
