import { useEffect, useRef } from 'react';

import { useAppSelector } from '@/hooks';
import { selectHasActiveCall, selectIncomingCalls } from '@/store/call/callSelectors';
import { cancelCallNotification } from '@/utils/callNotifications';

// The app's own call UI replaces the ringing notification, but only once the call has
// reached this device: on a cold start from the push the store is still empty, and
// cancelling then would take the ring away before the agent ever saw it.
export const useCallNotificationDismissal = () => {
  const incomingCount = useAppSelector(selectIncomingCalls).length;
  const hasActiveCall = useAppSelector(selectHasActiveCall);
  const hadCallRef = useRef(false);

  useEffect(() => {
    if (incomingCount || hasActiveCall) {
      hadCallRef.current = true;
      cancelCallNotification();
      return;
    }
    if (hadCallRef.current) {
      hadCallRef.current = false;
      cancelCallNotification();
    }
  }, [incomingCount, hasActiveCall]);
};
