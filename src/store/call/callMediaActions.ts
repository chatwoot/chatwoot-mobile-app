import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import { callEngine } from '@/services/voice/callEngine';
import {
  holdCallNatively,
  resumeCallNatively,
  type AudioRoute,
} from '@/services/voice/chatwootCalls';

import { setAudioRoute, setMuted, setOnHold, setSpeakerOn } from './callSlice';
import {
  selectActiveCall,
  selectAudioRoute,
  selectIsMuted,
  selectIsOnHold,
  selectIsSpeakerOn,
} from './callSelectors';

// Mute, hold and audio routing on the call this device is carrying
export const callMediaActions = {
  toggleMute: createAsyncThunk<boolean, void, { state: RootState }>(
    'calls/toggleMute',
    async (_, { getState, dispatch }) => {
      const next = !selectIsMuted(getState());
      await callEngine.setMuted(next);
      dispatch(setMuted(next));
      return next;
    },
  ),
  // The system holds and resumes the call around a cellular one; the mute the agent
  // had chosen comes back with the call
  setHold: createAsyncThunk<boolean, boolean, { state: RootState }>(
    'calls/setHold',
    async (hold, { dispatch, getState }) => {
      await callEngine.setHold(hold);
      if (!hold) await callEngine.setMuted(selectIsMuted(getState()));
      dispatch(setOnHold(hold));
      return hold;
    },
  ),
  // Hold from the call screen. Where the platform tracks the call it owns the change and
  // the hold action brings the state back; elsewhere the engine is held directly
  toggleHold: createAsyncThunk<boolean, void, { state: RootState }>(
    'calls/toggleHold',
    async (_, { dispatch, getState }) => {
      const hold = !selectIsOnHold(getState());
      const callSid = selectActiveCall(getState())?.callSid;
      const handledNatively =
        !!callSid && (hold ? holdCallNatively(callSid) : resumeCallNatively(callSid));
      if (!handledNatively) await dispatch(callMediaActions.setHold(hold));
      return hold;
    },
  ),
  selectAudioRoute: createAsyncThunk<AudioRoute, AudioRoute, { state: RootState }>(
    'calls/selectAudioRoute',
    async (route, { dispatch, getState }) => {
      await callEngine.setAudioRoute(route);
      const current = selectAudioRoute(getState());
      dispatch(
        setAudioRoute({ current: route, available: current.available, names: current.names }),
      );
      return route;
    },
  ),
  toggleSpeaker: createAsyncThunk<boolean, void, { state: RootState }>(
    'calls/toggleSpeaker',
    async (_, { getState, dispatch }) => {
      const next = !selectIsSpeakerOn(getState());
      await callEngine.setSpeaker(next);
      dispatch(setSpeakerOn(next));
      return next;
    },
  ),
};
