import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import { VOICE_CALL_PROVIDERS } from '@/constants';
import { isSystemCallUiAvailable } from '@/services/voice/chatwootCalls';
import { isOutboundCallRinging } from '@/utils/voiceCallUtils';

export const selectCallsState = (state: RootState) => state.calls;

export const selectCalls = createSelector(selectCallsState, state => state.calls);

export const selectActiveCall = createSelector(
  selectCalls,
  calls => calls.find(call => call.isActive) || null,
);

export const selectHasActiveCall = createSelector(selectActiveCall, call => call !== null);

export const selectIncomingCalls = createSelector(selectCalls, calls =>
  calls.filter(call => !call.isActive),
);

export const selectHasIncomingCall = createSelector(selectIncomingCalls, calls => calls.length > 0);

export const selectFullScreenCall = createSelector(
  selectActiveCall,
  selectIncomingCalls,
  (state: RootState) => state.calls.localCallSid,
  (activeCall, incomingCalls, localCallSid) => {
    if (activeCall) return activeCall;
    const joining = incomingCalls.find(call => call.callSid === localCallSid);
    if (joining) return joining;
    const outbound = incomingCalls.find(call => call.callDirection === 'outbound');
    if (outbound) return outbound;
    const inbound = incomingCalls.filter(call => call.callDirection === 'inbound');
    if (!isSystemCallUiAvailable()) return inbound[0] ?? null;
    return inbound.find(call => call.systemUiFailed) ?? null;
  },
);

export const selectPlacingCall = createSelector(selectCallsState, state => state.placingCall);

export const selectIsCallMinimised = createSelector(selectCallsState, state => state.isMinimised);

export const selectIsJoining = createSelector(selectCallsState, state => state.isJoining);

export const selectLocalCallSid = createSelector(selectCallsState, state => state.localCallSid);

export const selectDismissedCallSids = createSelector(
  selectCallsState,
  state => state.dismissedCallSids,
);

export const selectIsMuted = createSelector(selectCallsState, state => state.isMuted);

export const selectIsOnHold = createSelector(selectCallsState, state => state.isOnHold);

export const selectIsSpeakerOn = createSelector(
  selectCallsState,
  state => state.audioRoute.current === 'speaker',
);

export const selectAudioRoute = createSelector(selectCallsState, state => state.audioRoute);

export const selectIsRingingBack = createSelector(
  [selectCalls, selectLocalCallSid],
  (calls, localCallSid) =>
    calls.some(
      call =>
        call.callSid === localCallSid &&
        call.provider === VOICE_CALL_PROVIDERS.WHATSAPP &&
        call.callDirection === 'outbound' &&
        !call.isActive &&
        isOutboundCallRinging(call),
    ),
);
