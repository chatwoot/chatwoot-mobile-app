import { useEffect, useRef } from 'react';

import { useAppSelector } from '@/hooks';
import { selectHasActiveCall, selectIncomingCalls } from '@/store/call/callSelectors';
import { cancelCallNotification } from '@/utils/callNotifications';

import { useAppInFront } from './useAppInFront';

// The app's own call UI replaces the ringing notification, but only while the app is in
// front and once the call has reached this device: on a cold start from the push the store
// is still empty, and behind the lock screen or in the background the notification and
// ring screen are all the agent has.
export const useCallNotificationDismissal = () => {
  const incomingCount = useAppSelector(selectIncomingCalls).length;
  const hasActiveCall = useAppSelector(selectHasActiveCall);
  const appInFront = useAppInFront();
  const hadCallRef = useRef(false);

  useEffect(() => {
    if (!appInFront) return;
    if (incomingCount || hasActiveCall) {
      hadCallRef.current = true;
      cancelCallNotification();
      return;
    }
    if (hadCallRef.current) {
      hadCallRef.current = false;
      cancelCallNotification();
    }
  }, [appInFront, incomingCount, hasActiveCall]);
};
