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
  isSpeakerOn: false,
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

    removeCallsForConversation: (state, action: PayloadAction<number>) => {
      state.calls = state.calls.filter(call => call.conversationId !== action.payload);
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
        names?: string[] | Partial<Record<AudioRoute, string>>;
      }>,
    ) => {
      // Names arrive as a list beside the routes, or as the map already built
      const given = action.payload.names;
      const list = Array.isArray(given) ? given : null;
      const names: Partial<Record<AudioRoute, string>> = list
        ? {}
        : {
            ...((given as Partial<Record<AudioRoute, string>> | undefined) ??
              state.audioRoute.names),
          };
      if (list) {
        action.payload.available.forEach((route, index) => {
          const name = list[index];
          if (name) names[route] = name;
        });
      }
      state.audioRoute = {
        current: action.payload.current,
        available: action.payload.available,
        names,
      };
      if (action.payload.current !== 'unknown')
        state.isSpeakerOn = action.payload.current === 'speaker';
    },

    setSpeakerOn: (state, action: PayloadAction<boolean>) => {
      state.isSpeakerOn = action.payload;
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

    setCallAnswer: (state, action: PayloadAction<{ callSid: string; sdpAnswer: string }>) => {
      const call = state.calls.find(entry => entry.callSid === action.payload.callSid);
      if (call) call.sdpAnswer = action.payload.sdpAnswer;
    },

    clearActiveCall: state => {
      state.calls = state.calls.filter(call => !call.isActive);
      state.isMuted = false;
      state.isSpeakerOn = false;
      state.isOnHold = false;
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
      if (callSid && !state.dismissedCallSids.includes(callSid)) {
        state.dismissedCallSids.push(callSid);
      }
      state.calls = state.calls.filter(call => call.callSid !== callSid);
    },

    // Hides the call locally without touching the provider
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

    resetCalls: () => initialState,
  },
});

export const {
  addCall,
  removeCall,
  removeCallsForConversation,
  setCallActive,
  setMuted,
  setOnHold,
  setSpeakerOn,
  setAudioRoute,
  setSystemUuid,
  setMinimised,
  setPlacingCall,
  markSystemUiFailed,
  setCallAnswer,
  clearActiveCall,
  handleCallStatusChanged,
  setCallProviderStatus,
  dismissCall,
  markCallDismissed,
  markLocalCall,
  clearLocalCall,
  setIsJoining,
  resetCalls,
} = callSlice.actions;

export default callSlice.reducer;
