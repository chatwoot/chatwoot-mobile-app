import { useMemo } from 'react';

import { useAppSelector } from '@/hooks';
import { selectFullScreenCall, selectPlacingCall } from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';

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
            accountId: placingCall.accountId,
            caller: placingCall.caller,
            callDirection: 'outbound',
            isActive: false,
            addedAt: Date.now(),
          }
        : null,
    [placingCall],
  );
  return liveCall ?? placeholderCall;
};
