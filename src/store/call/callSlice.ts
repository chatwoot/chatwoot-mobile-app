import type { AudioRoute } from '@/services/voice/chatwootCalls';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { VOICE_CALL_STATUS } from '@/constants';
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
  isMuted: false,
  isOnHold: false,
  audioRoute: { current: 'earpiece', available: ['earpiece', 'speaker'], names: {} },
  isMinimised: false,
  placingCall: null,
};

const callSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    // Merges into an existing entry by callSid so a later event can fill in fields
    // the earlier one lacked; a previously captured caller snapshot is kept when the
    // new payload has none. New calls go first so the newest rings as primary.
    addCall: (state, action: PayloadAction<LiveCallInput>) => {
      const incoming = action.payload;
      if (!incoming?.callSid) return;
      if (state.dismissedCallSids.includes(incoming.callSid)) return;
      if (incoming.callDirection === 'outbound') state.placingCall = null;

      const existing = state.calls.find(call => call.callSid === incoming.callSid);
      if (existing) {
        const next: Partial<LiveCall> = { ...incoming };
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
      // A call that has just arrived opens the call screen, whatever was minimised before
      state.isMinimised = false;
    },

    removeCall: (state, action: PayloadAction<string>) => {
      state.calls = state.calls.filter(call => call.callSid !== action.payload);
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

    // The platform's report of the route in use and the routes on offer. An unknown route
    // leaves the last known one in place; names are kept when none are given.
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

    // Speaker on, or off to the best other route on offer: a headset first, then the
    // earpiece. The platform's next route report corrects it if it chose otherwise.
    setSpeakerOn: (state, action: PayloadAction<boolean>) => {
      const { available } = state.audioRoute;
      state.audioRoute.current = action.payload
        ? 'speaker'
        : ((['bluetooth', 'wired'] as AudioRoute[]).find(route => available.includes(route)) ??
          'earpiece');
    },

    setPlacingCall: (state, action: PayloadAction<PlacingCall | null>) => {
      state.placingCall = action.payload;
      if (action.payload) state.isMinimised = false;
    },

    setMinimised: (state, action: PayloadAction<boolean>) => {
      state.isMinimised = action.payload;
    },

    setSystemUuid: (state, action: PayloadAction<{ callSid: string; systemUuid: string }>) => {
      const call = state.calls.find(entry => entry.callSid === action.payload.callSid);
      if (call) call.systemUuid = action.payload.systemUuid;
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
      if (call) call.providerStatus = action.payload.providerStatus ?? null;
    },

    handleCallStatusChanged: (
      state,
      action: PayloadAction<{ callSid: string; status?: string | null }>,
    ) => {
      const { callSid, status } = action.payload;
      if (!isTerminalCallStatus(status)) return;
      callSlice.caseReducers.dismissCall(state, { type: 'calls/dismissCall', payload: callSid });
    },

    // Hides the call on this device and keeps it from being re-added; other agents keep
    // ringing
    dismissCall: (state, action: PayloadAction<string>) => {
      const callSid = action.payload;
      if (callSid && !state.dismissedCallSids.includes(callSid)) {
        state.dismissedCallSids.push(callSid);
      }
      state.calls = state.calls.filter(call => call.callSid !== callSid);
    },

    markCallDismissed: (state, action: PayloadAction<string | undefined>) => {
      const callSid = action.payload;
      if (callSid && !state.dismissedCallSids.includes(callSid)) {
        state.dismissedCallSids.push(callSid);
      }
    },

    markLocalCall: (state, action: PayloadAction<string | null>) => {
      state.localCallSid = action.payload || null;
    },

    clearLocalCall: (state, action: PayloadAction<string>) => {
      if (state.localCallSid === action.payload) state.localCallSid = null;
    },

    setIsJoining: (state, action: PayloadAction<boolean>) => {
      state.isJoining = action.payload;
    },

    // Another account's rings no longer apply; the call this device is on carries on
    keepOnlyLocalCall: state => {
      state.calls = state.calls.filter(
        call => call.isActive || call.callSid === state.localCallSid,
      );
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
  clearActiveCall,
  handleCallStatusChanged,
  setCallProviderStatus,
  dismissCall,
  markCallDismissed,
  markLocalCall,
  clearLocalCall,
  setIsJoining,
  keepOnlyLocalCall,
} = callSlice.actions;

export default callSlice.reducer;
