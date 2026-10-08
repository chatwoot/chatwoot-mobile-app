import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';

import type { RootState } from '@/store';
import { VOICE_CALL_PROVIDERS } from '@/constants';

import { callEngine } from '@/services/voice/callEngine';
import { closeSession, isSessionClosing, trackJoin } from '@/services/voice/pendingJoins';
import { selectCurrentUserAccountId, selectUserId } from '@/store/auth/authSelectors';
import type { VoiceCallProvider } from '@/types';

import { callMediaActions } from './callMediaActions';
import { callSyncActions } from './callSyncActions';
import { CallService } from './callService';
import { takeEarlyOutboundEvents } from './earlyOutboundEvents';
import {
  addCall,
  clearActiveCall,
  clearLocalCall,
  dismissCall,
  markCallDismissed,
  markLocalCall,
  removeCall,
  setCallActive,
  setIsJoining,
  setPlacingCall,
} from './callSlice';
import {
  selectActiveCall,
  selectCalls,
  selectDismissedCallSids,
  selectHasActiveCall,
  selectHasIncomingCall,
  selectIsJoining,
  selectIsMuted,
  selectIsOnHold,
  selectIsSpeakerOn,
  selectLocalCallSid,
  selectPlacingCall,
} from './callSelectors';

export type JoinCallResult =
  | { status: 'joined' }
  | { status: 'locked' }
  | { status: 'answered_elsewhere' }
  | { status: 'already_ended' };

const digest = (value: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);

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
  | { status: 'cancelled' }
  | { status: 'permission_requested' | 'permission_pending' };

// The agent can end a call that is still being placed. The provider request may already
// be in flight, so the call is torn down as soon as it has an id to tear down. Each
// placing attempt has a number and cancelling marks the current one, so a late result
// from an earlier attempt cannot revive it or clear the next one.
let placingAttempt = 0;
const cancelledAttempts = new Set<number>();

const findCall = (state: RootState, callSid: string) =>
  selectCalls(state).find(call => call.callSid === callSid);

// Placing, answering, ending and dismissing calls, plus the media and sync actions
// A call joins with the mute, speaker and hold chosen while it connected, from the call
// screen or the OS; with none made it starts unmuted and live, on the route the system
// picked, as each new call's state does
const keepAudioChoices = async (getState: () => RootState) => {
  await callEngine.setMuted(selectIsMuted(getState())).catch(() => {});
  if (selectIsSpeakerOn(getState())) await callEngine.setSpeaker(true).catch(() => {});
  // A hold the OS placed while the call connected, for another app's call
  if (selectIsOnHold(getState())) await callEngine.setHold(true).catch(() => {});
};

export const callActions = {
  ...callMediaActions,
  ...callSyncActions,

  // Declines for everyone: WhatsApp inbound → reject, WhatsApp outbound still ringing →
  // terminate, Twilio → end the conference so the inbound leg hangs up. The local entry
  // is removed even if the request fails so the sheet never sticks; only a decline that
  // went through is remembered, so the server can bring back a call that still rings.
  rejectIncomingCall: createAsyncThunk<void, string, { state: RootState }>(
    'calls/rejectIncomingCall',
    async (callSid, { getState, dispatch }) => {
      const call = findCall(getState(), callSid);
      let declined = false;
      try {
        if (call?.provider === VOICE_CALL_PROVIDERS.WHATSAPP && call.callId) {
          if (call.callDirection === 'outbound') {
            await CallService.terminateWhatsappCall(call.callId, call.accountId);
          } else {
            await CallService.rejectWhatsappCall(call.callId, call.accountId);
          }
        } else if (call?.inboxId && call?.conversationId) {
          await CallService.leaveConference({
            inboxId: call.inboxId,
            conversationId: call.conversationId,
            callSid,
            accountId: call.accountId,
          });
        }
        declined = true;
      } finally {
        // A call this device placed carries media here, which ends with it
        if (call && selectLocalCallSid(getState()) === callSid) {
          await callEngine
            .hangup(call.provider === VOICE_CALL_PROVIDERS.WHATSAPP ? 'whatsapp' : 'twilio')
            .catch(() => {});
          dispatch(clearLocalCall(callSid));
        }
        if (declined) dispatch(markCallDismissed(callSid));
        dispatch(removeCall(callSid));
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
      // One call at a time, a call still being placed included
      if (selectHasActiveCall(state) || selectHasIncomingCall(state) || selectPlacingCall(state)) {
        return { status: 'locked' };
      }
      const senderId = selectUserId(state) ?? undefined;
      // The account the call is placed in, kept for its later requests should the agent
      // switch accounts while it is being placed
      const accountId = selectCurrentUserAccountId(state) ?? undefined;
      placingAttempt += 1;
      const attempt = placingAttempt;
      const cancelled = () => cancelledAttempts.has(attempt);
      // The call screen opens on this, before the media offer and the provider request
      dispatch(setPlacingCall({ conversationId, inboxId, provider, accountId }));

      try {
        if (provider === VOICE_CALL_PROVIDERS.WHATSAPP) {
          const offer = callEngine.whatsapp.createOffer();
          // Read as the offer starts, so a call placed while this one waits has its own
          const media = callEngine.session();
          let sdpOffer: string;
          try {
            sdpOffer = await offer;
          } catch (error) {
            // A cancelled placement's media can be abandoned while it opens
            if (cancelled()) return { status: 'cancelled' };
            throw error;
          }
          // The offer's microphone and connection are released unless a call comes of it
          const releaseOffer = () => callEngine.hangup('whatsapp', media).catch(() => {});
          if (cancelled()) {
            await releaseOffer();
            return { status: 'cancelled' };
          }
          let response;
          try {
            response = await CallService.initiateWhatsappCall({
              sdpOffer,
              conversationId,
              accountId,
            });
          } catch (error) {
            await releaseOffer();
            throw error;
          }
          if (
            response.status === 'permission_requested' ||
            response.status === 'permission_pending'
          ) {
            await releaseOffer();
            return { status: response.status };
          }
          if (response.status !== 'calling') {
            await releaseOffer();
            throw new Error((response as { error?: string }).error || 'WhatsApp call failed');
          }
          // The agent gave up while the call was placed: the provider's call is ended by its
          // id and only this attempt's media is released, without touching the store, which
          // may already hold a newer call
          if (cancelled()) {
            await releaseOffer();
            await CallService.terminateWhatsappCall(response.id, accountId).catch(() => {});
            return { status: 'cancelled' };
          }
          // The call ended before the request above returned, the contact declining at once;
          // there is no call to show, so only its media is released
          if (selectDismissedCallSids(getState()).includes(response.call_id)) {
            takeEarlyOutboundEvents(response.call_id);
            await releaseOffer();
            return { status: 'cancelled' };
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
              accountId,
            }),
          );
          // The contact's side may have answered before the request above returned
          const early = takeEarlyOutboundEvents(response.call_id);
          if (early.sdpAnswer) {
            await callEngine.whatsapp.applyAnswer(early.sdpAnswer).catch(() => {});
          }
          if (early.accepted) dispatch(setCallActive(response.call_id));
          return { status: 'calling', callSid: response.call_id };
        }

        if (!contactId) throw new Error('contactId is required for a Twilio call');
        const response = await CallService.startContactCall({
          contactId,
          inboxId,
          conversationId,
          accountId,
        });
        if (cancelled()) {
          await CallService.leaveConference({
            inboxId,
            conversationId: response.conversation_id ?? conversationId,
            callSid: response.call_sid,
            accountId,
          }).catch(() => {});
          return { status: 'cancelled' };
        }
        dispatch(markLocalCall(response.call_sid));
        dispatch(
          addCall({
            callSid: response.call_sid,
            conversationId: response.conversation_id ?? conversationId,
            inboxId,
            callDirection: 'outbound',
            provider: VOICE_CALL_PROVIDERS.TWILIO,
            senderId,
            accountId,
          }),
        );
        // The agent leg joins the conference right away; the contact is being dialed
        // meanwhile. A join that fails ends the call, since nobody would be on it. The join
        // is tracked so an end made meanwhile waits for it and ends what it established.
        const joined = await trackJoin(
          response.call_sid,
          dispatch(callActions.joinCall(response.call_sid)).unwrap(),
        ).catch(error => {
          dispatch(callActions.rejectIncomingCall(response.call_sid));
          throw error;
        });
        if (joined.status !== 'joined') {
          await dispatch(callActions.rejectIncomingCall(response.call_sid));
          throw new Error(`Joining the call failed: ${joined.status}`);
        }
        return { status: 'calling', callSid: response.call_sid };
      } finally {
        cancelledAttempts.delete(attempt);
        // A later attempt owns the placing state once it has started
        if (attempt === placingAttempt) dispatch(setPlacingCall(null));
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
      if (isSessionClosing()) return { status: 'already_ended' };
      const found = findCall(getState(), callSid);
      if (!found) return { status: 'already_ended' };
      // The account the call rang in, kept for its requests should the agent switch
      // accounts while it joins
      const call = {
        ...found,
        accountId: found.accountId ?? selectCurrentUserAccountId(getState()) ?? undefined,
      };

      // One call at a time on this device: answering ends the one it is already on, and
      // gives up a call still being placed. The answer is under way from here, so nothing
      // rings for the call being taken meanwhile, and an account switch keeps it.
      dispatch(setIsJoining(callSid));
      if (call.callDirection === 'inbound' && selectPlacingCall(getState())) {
        await dispatch(callActions.cancelPlacingCall());
      }
      await dispatch(callActions.releaseLocalCall(callSid));
      dispatch(markLocalCall(callSid));
      // The server's acceptance of a Twilio join, kept so a later setup failure can undo it
      let conferenceJoin: ReturnType<typeof CallService.joinConference> | null = null;
      let conference: Parameters<typeof CallService.leaveConference>[0] | null = null;
      try {
        if (call.provider !== VOICE_CALL_PROVIDERS.WHATSAPP || !call.callId) {
          if (!call.inboxId || !call.conversationId) throw new Error('Call has no inbox');
          conference = {
            inboxId: call.inboxId,
            conversationId: call.conversationId,
            callSid,
            accountId: call.accountId,
          };
          conferenceJoin = CallService.joinConference(conference);
          const [token, joined] = await Promise.all([
            CallService.getConferenceToken(call.inboxId, call.accountId),
            conferenceJoin.catch(error => {
              if (httpStatus(error) === 409) {
                dispatch(dismissCall(callSid));
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
          await keepAudioChoices(getState);
          return { status: 'joined' };
        }

        let { sdpOffer, iceServers } = call;
        if (!sdpOffer) {
          const details = await CallService.getWhatsappCall(call.callId, call.accountId);
          sdpOffer = details.sdp_offer ?? undefined;
          iceServers = details.ice_servers;
        }
        if (!sdpOffer) throw new Error('Call has no offer to answer');

        const sdpAnswer = await callEngine.whatsapp.createAnswer(sdpOffer, iceServers);
        try {
          await CallService.acceptWhatsappCall(call.callId, sdpAnswer, call.accountId);
        } catch (error) {
          await callEngine.whatsapp.hangup();
          if (httpStatus(error) === 409) {
            dispatch(dismissCall(callSid));
            dispatch(clearLocalCall(callSid));
            const message = (error as { response?: { data?: { error?: string } } }).response?.data
              ?.error;
            return message?.includes('ended')
              ? { status: 'already_ended' }
              : { status: 'answered_elsewhere' };
          }
          // With no response the server may have taken the answer while this device has no
          // media; a call it recorded as answered with this device's own answer is ended
          // rather than left connected to nobody. An answer from another device or agent,
          // or a response that refused this one, leaves the call alone.
          if (httpStatus(error) === undefined) {
            const current = await CallService.getWhatsappCall(call.callId, call.accountId).catch(
              () => null,
            );
            if (current?.answer_digest && current.answer_digest === (await digest(sdpAnswer))) {
              await CallService.terminateWhatsappCall(call.callId, call.accountId).catch(() => {});
            }
          }
          throw error;
        }
        dispatch(setCallActive(callSid));
        await keepAudioChoices(getState);
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
          // The server may have taken the join, even after the token request failed, while
          // this device has no media: the conference is left so the caller is not stranded
          const joinedConference = conference;
          conferenceJoin
            ?.then(() => joinedConference && CallService.leaveConference(joinedConference))
            .catch(() => {});
        }
        dispatch(clearLocalCall(callSid));
        throw error;
      } finally {
        dispatch(setIsJoining(false));
      }
    },
  ),

  // Ends a call that is still being placed, before the provider has given it an id. The
  // screen closes now; the start request tears the call down once it can.
  cancelPlacingCall: createAsyncThunk<void, void, { state: RootState }>(
    'calls/cancelPlacingCall',
    async (_, { dispatch }) => {
      cancelledAttempts.add(placingAttempt);
      dispatch(setPlacingCall(null));
      await callEngine.whatsapp.hangup().catch(() => {});
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
      // The microphone is released at once; the server is told after
      await callEngine
        .hangup(call.provider === VOICE_CALL_PROVIDERS.WHATSAPP ? 'whatsapp' : 'twilio')
        .catch(() => {});
      if (call.provider === VOICE_CALL_PROVIDERS.WHATSAPP && call.callId) {
        await CallService.terminateWhatsappCall(call.callId, call.accountId);
      } else if (call.inboxId && call.conversationId) {
        await CallService.leaveConference({
          inboxId: call.inboxId,
          conversationId: call.conversationId,
          callSid: call.callSid,
          accountId: call.accountId,
        });
      }
    },
  ),

  // Everything this device has going, before the session ends: a call still being placed
  // is given up, and the call this device is on, live or still ringing out, is ended
  endLocalCalls: createAsyncThunk<void, void, { state: RootState }>(
    'calls/endLocalCalls',
    async (_, { getState, dispatch }) => {
      if (selectPlacingCall(getState())) await dispatch(callActions.cancelPlacingCall());
      // A join still in flight would otherwise connect after the release; the release
      // waits for it and ends whatever it established, and no new join starts meanwhile
      await closeSession(() => dispatch(callActions.releaseLocalCall('')));
    },
  ),

  // Ends the call this device is on, other than keepSid: the live call, or a call it
  // placed that is still ringing
  releaseLocalCall: createAsyncThunk<void, string, { state: RootState }>(
    'calls/releaseLocalCall',
    async (keepSid, { getState, dispatch }) => {
      const state = getState();
      const active = selectActiveCall(state);
      if (active && active.callSid !== keepSid) {
        await dispatch(callActions.endCall())
          .unwrap()
          .catch(() => {});
        return;
      }
      const localSid = selectLocalCallSid(state);
      if (!localSid || localSid === keepSid) return;
      const local = findCall(state, localSid);
      if (local?.callDirection === 'outbound') {
        await dispatch(callActions.rejectIncomingCall(localSid))
          .unwrap()
          .catch(() => {});
      }
      if (local) {
        await callEngine
          .hangup(local.provider === VOICE_CALL_PROVIDERS.WHATSAPP ? 'whatsapp' : 'twilio')
          .catch(() => {});
      }
      dispatch(clearLocalCall(localSid));
    },
  ),
};
