import { useMemo } from 'react';

import { useAppSelector } from '@/hooks';
import { selectFullScreenCall, selectPlacingCall } from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';

// The call the call screen and the ongoing-call bar show. A call being placed is shown
// straight away, before the provider answers with its call id, so the button press has
// something to show and a minimised placement can be brought back.
export const useScreenCall = (): LiveCall | null => {
  const liveCall = useAppSelector(selectFullScreenCall);
  const placingCall = useAppSelector(selectPlacingCall);
  const placeholderCall: LiveCall | null = useMemo(
    () =>
      placingCall
        ? {
            callSid: '',
            provider: placingCall.provider,
            conversationId: placingCall.conversationId,
            inboxId: placingCall.inboxId,
            callDirection: 'outbound',
            isActive: false,
            addedAt: Date.now(),
          }
        : null,
    [placingCall],
  );
  return liveCall ?? placeholderCall;
};
