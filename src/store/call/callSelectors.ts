import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import { isSystemCallUiAvailable } from '@/services/voice/chatwootCalls';

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

// The newest ringing call is shown; older ones wait behind it, as on the web
export const selectPrimaryIncomingCall = createSelector(
  selectActiveCall,
  selectIncomingCalls,
  (activeCall, incomingCalls) => (activeCall ? null : incomingCalls[0] || null),
);

// The call that owns the full screen: a live call, a call this device placed, and, where
// the OS has no call screen of its own, an inbound ring as well. On iOS an inbound call
// rings in CallKit instead, and the sheet only stands in when CallKit refuses.
export const selectFullScreenCall = createSelector(
  selectActiveCall,
  selectIncomingCalls,
  (activeCall, incomingCalls) => {
    if (activeCall) return activeCall;
    const outbound = incomingCalls.find(call => call.callDirection === 'outbound');
    if (outbound) return outbound;
    if (isSystemCallUiAvailable()) return null;
    return incomingCalls.find(call => call.callDirection === 'inbound') ?? null;
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

export const selectIsSpeakerOn = createSelector(selectCallsState, state => state.isSpeakerOn);

export const selectAudioRoute = createSelector(selectCallsState, state => state.audioRoute);
