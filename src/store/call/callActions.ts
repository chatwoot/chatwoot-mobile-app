import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import { VOICE_CALL_PROVIDERS } from '@/constants';

import { callEngine } from '@/services/voice/callEngine';
import { selectUserId } from '@/store/auth/authSelectors';
import type { VoiceCallProvider } from '@/types';

import { callMediaActions } from './callMediaActions';
import { callSyncActions } from './callSyncActions';
import { CallService } from './callService';
import {
  addCall,
  clearActiveCall,
  clearLocalCall,
  dismissCall as dismissCallAction,
  markCallDismissed,
  markLocalCall,
  setCallActive,
  setIsJoining,
  setMuted,
  setSpeakerOn,
  setPlacingCall,
} from './callSlice';
import {
  selectActiveCall,
  selectCalls,
  selectHasActiveCall,
  selectHasIncomingCall,
  selectIsJoining,
} from './callSelectors';

export type JoinCallResult =
  | { status: 'joined' }
  | { status: 'locked' }
  | { status: 'answered_elsewhere' }
  | { status: 'already_ended' };

const httpStatus = (error: unknown) =>
  (error as { response?: { status?: number } })?.response?.status;

export type StartOutboundCallParams = {
  provider: VoiceCallProvider;
  conversationId: number;
  inboxId: number;
  contactId?: number;
};

export type StartOutboundCallResult =
  | { status: 'calling'; callSid: string }
  | { status: 'locked' }
  | { status: 'permission_requested' | 'permission_pending' };

const findCall = (state: RootState, callSid: string) =>
  selectCalls(state).find(call => call.callSid === callSid);

// Placing, answering, ending and dismissing calls, plus the media and sync actions
export const callActions = {
  ...callMediaActions,
  ...callSyncActions,

  // Declines for everyone: WhatsApp inbound → reject, WhatsApp outbound still ringing →
  // terminate, Twilio → end the conference so the inbound leg hangs up. The local entry
  // is dismissed even if the request fails so the sheet never sticks; the backend's
  // status update will re-add the call if it is genuinely still ringing.
  rejectIncomingCall: createAsyncThunk<void, string, { state: RootState }>(
    'calls/rejectIncomingCall',
    async (callSid, { getState, dispatch }) => {
      const call = findCall(getState(), callSid);
      try {
        if (call?.provider === VOICE_CALL_PROVIDERS.WHATSAPP && call.callId) {
          if (call.callDirection === 'outbound') {
            await CallService.terminateWhatsappCall(call.callId);
          } else {
            await CallService.rejectWhatsappCall(call.callId);
          }
        } else if (call?.inboxId && call?.conversationId) {
          await CallService.leaveConference({
            inboxId: call.inboxId,
            conversationId: call.conversationId,
            callSid,
          });
        }
      } finally {
        dispatch(markCallDismissed(callSid));
        dispatch(dismissCallAction(callSid));
      }
    },
  ),

  // Places a call from a conversation. Twilio dials the contact server-side and the agent
  // leg joins once media exists; WhatsApp needs an SDP offer from the media engine first.
  // The local marker is set before the call is added so the account-wide accepted
  // broadcast cannot tear down this device's own outbound call.
  startOutboundCall: createAsyncThunk<
    StartOutboundCallResult,
    StartOutboundCallParams,
    { state: RootState }
  >(
    'calls/startOutboundCall',
    async ({ provider, conversationId, inboxId, contactId }, { getState, dispatch }) => {
      const state = getState();
      if (selectHasActiveCall(state) || selectHasIncomingCall(state)) return { status: 'locked' };
      const senderId = selectUserId(state) ?? undefined;
      // The call screen opens on this, before the media offer and the provider request
      dispatch(setPlacingCall({ conversationId, inboxId, provider }));

      try {
        if (provider === VOICE_CALL_PROVIDERS.WHATSAPP) {
          const sdpOffer = await callEngine.whatsapp.createOffer();
          const response = await CallService.initiateWhatsappCall({ sdpOffer, conversationId });
          if (
            response.status === 'permission_requested' ||
            response.status === 'permission_pending'
          ) {
            return { status: response.status };
          }
          if (response.status !== 'calling') {
            throw new Error((response as { error?: string }).error || 'WhatsApp call failed');
          }
          dispatch(markLocalCall(response.call_id));
          dispatch(
            addCall({
              callSid: response.call_id,
              callId: response.id,
              conversationId: response.conversation_id ?? conversationId,
              inboxId,
              callDirection: 'outbound',
              provider: VOICE_CALL_PROVIDERS.WHATSAPP,
              senderId,
              recordingEnabled: response.recording_enabled,
            }),
          );
          return { status: 'calling', callSid: response.call_id };
        }

        if (!contactId) throw new Error('contactId is required for a Twilio call');
        const response = await CallService.startContactCall({ contactId, inboxId, conversationId });
        dispatch(markLocalCall(response.call_sid));
        dispatch(
          addCall({
            callSid: response.call_sid,
            conversationId: response.conversation_id ?? conversationId,
            inboxId,
            callDirection: 'outbound',
            provider: VOICE_CALL_PROVIDERS.TWILIO,
            senderId,
          }),
        );
        // The agent leg joins the conference right away; the contact is being dialed meanwhile
        dispatch(callActions.joinCall(response.call_sid));
        return { status: 'calling', callSid: response.call_sid };
      } finally {
        dispatch(setPlacingCall(null));
      }
    },
  ),

  // Answers an inbound WhatsApp call on this device. The local marker is set before the
  // accept request so the account-wide accepted broadcast does not tear the call down.
  // A 409 means another agent or the caller got there first.
  joinCall: createAsyncThunk<JoinCallResult, string, { state: RootState }>(
    'calls/joinCall',
    async (callSid, { getState, dispatch }) => {
      if (selectIsJoining(getState())) return { status: 'locked' };
      const call = findCall(getState(), callSid);
      if (!call) return { status: 'already_ended' };

      dispatch(setIsJoining(true));
      dispatch(markLocalCall(callSid));
      try {
        if (call.provider !== VOICE_CALL_PROVIDERS.WHATSAPP || !call.callId) {
          if (!call.inboxId || !call.conversationId) throw new Error('Call has no inbox');
          const [token, joined] = await Promise.all([
            CallService.getConferenceToken(call.inboxId),
            CallService.joinConference({
              inboxId: call.inboxId,
              conversationId: call.conversationId,
              callSid,
            }).catch(error => {
              if (httpStatus(error) === 409) {
                dispatch(markCallDismissed(callSid));
                dispatch(dismissCallAction(callSid));
                dispatch(clearLocalCall(callSid));
              }
              throw error;
            }),
          ]);
          await callEngine.twilio.connect(token.token, {
            To: joined.conference_sid,
            is_agent: 'true',
            conversation_id: String(call.conversationId),
            call_sid: callSid,
          });
          dispatch(setCallActive(callSid));
          dispatch(setMuted(false));
          dispatch(setSpeakerOn(false));
          return { status: 'joined' };
        }

        let { sdpOffer, iceServers } = call;
        if (!sdpOffer) {
          const details = await CallService.getWhatsappCall(call.callId);
          sdpOffer = details.sdp_offer ?? undefined;
          iceServers = details.ice_servers;
        }
        if (!sdpOffer) throw new Error('Call has no offer to answer');

        const sdpAnswer = await callEngine.whatsapp.createAnswer(sdpOffer, iceServers);
        try {
          await CallService.acceptWhatsappCall(call.callId, sdpAnswer);
        } catch (error) {
          await callEngine.whatsapp.hangup();
          if (httpStatus(error) === 409) {
            dispatch(markCallDismissed(callSid));
            dispatch(dismissCallAction(callSid));
            dispatch(clearLocalCall(callSid));
            const message = (error as { response?: { data?: { error?: string } } }).response?.data
              ?.error;
            return message?.includes('ended')
              ? { status: 'already_ended' }
              : { status: 'answered_elsewhere' };
          }
          throw error;
        }
        dispatch(setCallActive(callSid));
        dispatch(setMuted(false));
        dispatch(setSpeakerOn(false));
        return { status: 'joined' };
      } catch (error) {
        if (httpStatus(error) === 409) {
          return { status: 'answered_elsewhere' };
        }
        console.error('Failed to join call:', error);
        if (call.provider === VOICE_CALL_PROVIDERS.WHATSAPP) {
          await callEngine.whatsapp.hangup().catch(() => {});
        } else {
          await callEngine.twilio.disconnect().catch(() => {});
        }
        dispatch(clearLocalCall(callSid));
        throw error;
      } finally {
        dispatch(setIsJoining(false));
      }
    },
  ),

  // Ends the call this device is on. The screen closes and the microphone is released at
  // once, because waiting for the provider's reply leaves a dead call on screen; the
  // request then goes out so the contact drops too.
  endCall: createAsyncThunk<void, void, { state: RootState }>(
    'calls/endCall',
    async (_, { getState, dispatch }) => {
      const call = selectActiveCall(getState());
      if (!call) return;
      dispatch(markCallDismissed(call.callSid));
      dispatch(clearActiveCall());
      dispatch(clearLocalCall(call.callSid));
      try {
        if (call.provider === VOICE_CALL_PROVIDERS.WHATSAPP && call.callId) {
          await CallService.terminateWhatsappCall(call.callId);
        } else if (call.inboxId && call.conversationId) {
          await CallService.leaveConference({
            inboxId: call.inboxId,
            conversationId: call.conversationId,
            callSid: call.callSid,
          });
        }
      } finally {
        if (call.provider === VOICE_CALL_PROVIDERS.WHATSAPP) {
          await callEngine.whatsapp.hangup().catch(() => {});
        } else {
          await callEngine.twilio.disconnect().catch(() => {});
        }
      }
    },
  ),

  // Hides the call on this device only; other agents keep ringing.
  dismissCall: createAsyncThunk<void, string>(
    'calls/dismissCall',
    async (callSid, { dispatch }) => {
      dispatch(markCallDismissed(callSid));
      dispatch(dismissCallAction(callSid));
    },
  ),
};
