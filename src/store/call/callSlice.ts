import type { AudioRoute } from '@/services/voice/chatwootCalls';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { VOICE_CALL_STATUS } from '@/constants';
import { isTwilioAnswerStatus } from '@/utils/voiceCallUtils';
import type { CallState, LiveCall, LiveCallInput, PlacingCall } from './callTypes';

const TERMINAL_STATUSES: string[] = [
  VOICE_CALL_STATUS.COMPLETED,
  VOICE_CALL_STATUS.NO_ANSWER,
  VOICE_CALL_STATUS.FAILED,
  VOICE_CALL_STATUS.REJECTED,
];

export const isTerminalCallStatus = (status?: string | null) =>
  !!status && TERMINAL_STATUSES.includes(status);

const initialState: CallState = {
  calls: [],
  dismissedCallSids: [],
  localCallSid: null,
  isJoining: false,
  joiningCallSid: null,
  isMuted: false,
  isOnHold: false,
  audioRoute: { current: 'earpiece', available: ['earpiece', 'speaker'], names: {} },
  isMinimised: false,
  placingCall: null,
};

const resetMediaWhenIdle = (state: CallState) => {
  if (state.localCallSid || state.isJoining || state.placingCall) return;
  if (state.calls.some(call => call.isActive || call.callDirection === 'outbound')) return;
  state.isMuted = false;
  state.isOnHold = false;
};

const callSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    addCall: (state, action: PayloadAction<LiveCallInput>) => {
      const incoming = action.payload;
      if (!incoming?.callSid) return;
      if (state.dismissedCallSids.includes(incoming.callSid)) return;
      if (incoming.callDirection === 'outbound') state.placingCall = null;

      const existing = state.calls.find(call => call.callSid === incoming.callSid);
      if (existing) {
        const next = Object.fromEntries(
          Object.entries(incoming).filter(([, value]) => value !== undefined),
        ) as Partial<LiveCall>;
        if (existing.caller && !next.caller) delete next.caller;
        delete next.isActive;
        delete next.addedAt;
        Object.assign(existing, next);
        return;
      }

      state.calls.unshift({
        ...incoming,
        isActive: incoming.isActive ?? false,
        addedAt: incoming.addedAt ?? Date.now(),
      });
      state.isMinimised = false;
    },

    removeCall: (state, action: PayloadAction<string>) => {
      state.calls = state.calls.filter(call => call.callSid !== action.payload);
      resetMediaWhenIdle(state);
    },

    setCallActive: {
      reducer: (state, action: PayloadAction<{ callSid: string; activeSince: number }>) => {
        state.calls.forEach(call => {
          call.isActive = call.callSid === action.payload.callSid;
          if (call.isActive && !call.activeSince) {
            call.activeSince = action.payload.activeSince;
            state.isMinimised = false;
          }
        });
      },
      prepare: (callSid: string, activeSince: number = Date.now()) => ({
        payload: { callSid, activeSince },
      }),
    },

    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
    },

    setOnHold: (state, action: PayloadAction<boolean>) => {
      state.isOnHold = action.payload;
    },

    setAudioRoute: (
      state,
      action: PayloadAction<{
        current: AudioRoute;
        available: AudioRoute[];
        names?: Partial<Record<AudioRoute, string>>;
      }>,
    ) => {
      const { current, available, names } = action.payload;
      state.audioRoute = {
        current: current === 'unknown' ? state.audioRoute.current : current,
        available,
        names: names ?? state.audioRoute.names,
      };
    },

    setSpeakerOn: (state, action: PayloadAction<boolean>) => {
      const { available } = state.audioRoute;
      state.audioRoute.current = action.payload
        ? 'speaker'
        : ((['bluetooth', 'wired'] as AudioRoute[]).find(route => available.includes(route)) ??
          'earpiece');
    },

    setPlacingCall: (state, action: PayloadAction<PlacingCall | null>) => {
      state.placingCall = action.payload;
      if (action.payload) {
        state.isMinimised = false;
        state.isMuted = false;
        state.isOnHold = false;
      } else {
        resetMediaWhenIdle(state);
      }
    },

    setMinimised: (state, action: PayloadAction<boolean>) => {
      state.isMinimised = action.payload;
    },

    setSystemUuid: (state, action: PayloadAction<{ callSid: string; systemUuid: string }>) => {
      const call = state.calls.find(entry => entry.callSid === action.payload.callSid);
      if (call) call.systemUuid = action.payload.systemUuid;
    },

    clearSystemCalls: state => {
      state.calls.forEach(call => {
        delete call.systemUuid;
        if (call.callDirection === 'inbound' && !call.isActive) call.systemUiFailed = true;
      });
    },

    markSystemUiFailed: (state, action: PayloadAction<string>) => {
      const call = state.calls.find(entry => entry.callSid === action.payload);
      if (call) call.systemUiFailed = true;
    },

    clearActiveCall: state => {
      state.calls = state.calls.filter(call => !call.isActive);
      state.isMuted = false;
      state.isOnHold = false;
      state.audioRoute = initialState.audioRoute;
    },

    setCallProviderStatus: (
      state,
      action: PayloadAction<{ callSid: string; providerStatus: string | null | undefined }>,
    ) => {
      const call = state.calls.find(entry => entry.callSid === action.payload.callSid);
      if (!call) return;
      call.providerStatus = action.payload.providerStatus ?? null;
      if (!call.answeredAt && isTwilioAnswerStatus(call.providerStatus)) {
        call.answeredAt = Date.now();
      }
    },

    handleCallStatusChanged: (
      state,
      action: PayloadAction<{ callSid: string; status?: string | null }>,
    ) => {
      const { callSid, status } = action.payload;
      if (!isTerminalCallStatus(status)) return;
      callSlice.caseReducers.dismissCall(state, { type: 'calls/dismissCall', payload: callSid });
    },

    dismissCall: (state, action: PayloadAction<string>) => {
      const callSid = action.payload;
      if (callSid && !state.dismissedCallSids.includes(callSid)) {
        state.dismissedCallSids.push(callSid);
      }
      state.calls = state.calls.filter(call => call.callSid !== callSid);
      resetMediaWhenIdle(state);
    },

    markCallDismissed: (state, action: PayloadAction<string | undefined>) => {
      const callSid = action.payload;
      if (callSid && !state.dismissedCallSids.includes(callSid)) {
        state.dismissedCallSids.push(callSid);
      }
    },

    forgetCallDismissed: (state, action: PayloadAction<string>) => {
      state.dismissedCallSids = state.dismissedCallSids.filter(
        callSid => callSid !== action.payload,
      );
    },

    markLocalCall: (state, action: PayloadAction<string | null>) => {
      state.localCallSid = action.payload || null;
    },

    clearLocalCall: (state, action: PayloadAction<string>) => {
      if (state.localCallSid === action.payload) state.localCallSid = null;
      resetMediaWhenIdle(state);
    },

    setIsJoining: (state, action: PayloadAction<boolean | string>) => {
      state.isJoining = !!action.payload;
      state.joiningCallSid = typeof action.payload === 'string' ? action.payload : null;
      if (!state.isJoining) resetMediaWhenIdle(state);
    },

    keepOnlyLocalCall: (
      state,
      action: PayloadAction<{ leaving?: number | null; entering?: number | null }>,
    ) => {
      const { leaving, entering } = action.payload;
      state.calls = state.calls.filter(
        call =>
          call.isActive ||
          call.callSid === state.localCallSid ||
          call.callSid === state.joiningCallSid ||
          (entering != null && call.accountId === entering),
      );
      state.calls.forEach(call => {
        if (call.accountId == null && leaving) call.accountId = leaving;
      });
    },
  },
});

export const {
  addCall,
  removeCall,
  setCallActive,
  setMuted,
  setOnHold,
  setSpeakerOn,
  setAudioRoute,
  setSystemUuid,
  setMinimised,
  setPlacingCall,
  markSystemUiFailed,
  clearSystemCalls,
  clearActiveCall,
  handleCallStatusChanged,
  setCallProviderStatus,
  dismissCall,
  markCallDismissed,
  forgetCallDismissed,
  markLocalCall,
  clearLocalCall,
  setIsJoining,
  keepOnlyLocalCall,
} = callSlice.actions;

export default callSlice.reducer;
