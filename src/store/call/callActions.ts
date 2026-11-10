import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';

import type { RootState } from '@/store';
import { VOICE_CALL_PROVIDERS } from '@/constants';

import { callEngine } from '@/services/voice/callEngine';
import {
  closeSession,
  isJoinCancelled,
  isSessionClosing,
  trackJoin,
} from '@/services/voice/pendingJoins';
import { selectCurrentUserAccountId, selectUserId } from '@/store/auth/authSelectors';
import type { VoiceCallProvider } from '@/types';

import { callMediaActions } from './callMediaActions';
import { callSyncActions } from './callSyncActions';
import { CallService } from './callService';
import { takeEarlyOutboundEvents } from './earlyOutboundEvents';
import type { CallerSnapshot } from './callTypes';
import {
  addCall,
  clearActiveCall,
  clearLocalCall,
  dismissCall,
  forgetCallDismissed,
  markCallDismissed,
  markLocalCall,
  setCallActive,
  setCallProviderStatus,
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
  conversationId?: number;
  inboxId: number;
  contactId?: number;
  caller?: CallerSnapshot | null;
};

export type StartOutboundCallResult =
  | { status: 'calling'; callSid: string }
  | { status: 'locked' }
  | { status: 'cancelled' }
  | { status: 'permission_requested' | 'permission_pending' };

// Cancelled placements can still return calls.
let placingAttempt = 0;
const cancelledAttempts = new Set<number>();

const findCall = (state: RootState, callSid: string) =>
  selectCalls(state).find(call => call.callSid === callSid);

const keepAudioChoices = async (getState: () => RootState) => {
  await callEngine.setMuted(selectIsMuted(getState())).catch(() => {});
  if (selectIsSpeakerOn(getState())) await callEngine.setSpeaker(true).catch(() => {});
  if (selectIsOnHold(getState())) await callEngine.setHold(true).catch(() => {});
};

export const callActions = {
  ...callMediaActions,
  ...callSyncActions,

  // Dismissal prevents sync from restoring rings.
  rejectIncomingCall: createAsyncThunk<void, string, { state: RootState }>(
    'calls/rejectIncomingCall',
    async (callSid, { getState, dispatch }) => {
      const call = findCall(getState(), callSid);
      let declined = false;
      const ownsMedia = !!call && selectLocalCallSid(getState()) === callSid;
      if (ownsMedia) {
        await callEngine
          .hangup(call.provider === VOICE_CALL_PROVIDERS.WHATSAPP ? 'whatsapp' : 'twilio')
          .catch(() => {});
      }
      if (ownsMedia) dispatch(clearLocalCall(callSid));
      dispatch(dismissCall(callSid));
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
        if (!declined) dispatch(forgetCallDismissed(callSid));
      }
    },
  ),

  startOutboundCall: createAsyncThunk<
    StartOutboundCallResult,
    StartOutboundCallParams,
    { state: RootState }
  >(
    'calls/startOutboundCall',
    async ({ provider, conversationId, inboxId, contactId, caller }, { getState, dispatch }) => {
      const state = getState();
      if (
        selectHasActiveCall(state) ||
        selectHasIncomingCall(state) ||
        selectPlacingCall(state) ||
        selectIsJoining(state)
      ) {
        return { status: 'locked' };
      }
      const senderId = selectUserId(state) ?? undefined;
      const accountId = selectCurrentUserAccountId(state) ?? undefined;
      placingAttempt += 1;
      const attempt = placingAttempt;
      const cancelled = () => cancelledAttempts.has(attempt);
      dispatch(setPlacingCall({ conversationId, inboxId, provider, accountId, caller }));

      try {
        if (provider === VOICE_CALL_PROVIDERS.WHATSAPP) {
          const offer = callEngine.whatsapp.createOffer();
          // Capture ownership before another session starts.
          const media = callEngine.session();
          let sdpOffer: string;
          try {
            sdpOffer = await offer;
          } catch (error) {
            if (cancelled()) return { status: 'cancelled' };
            throw error;
          }
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
              contactId,
              inboxId,
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
          if (cancelled()) {
            await releaseOffer();
            await CallService.terminateWhatsappCall(response.id, accountId).catch(() => {});
            return { status: 'cancelled' };
          }
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
              caller,
            }),
          );
          // Socket events can precede placement responses.
          const early = takeEarlyOutboundEvents(response.call_id);
          if (early.sdpAnswer) {
            const applied = await callEngine.whatsapp.applyAnswer(early.sdpAnswer).then(
              () => true,
              () => false,
            );
            if (!applied) {
              await dispatch(callActions.rejectIncomingCall(response.call_id));
              throw new Error('The contact answer could not be applied');
            }
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
        if (selectDismissedCallSids(getState()).includes(response.call_sid)) {
          takeEarlyOutboundEvents(response.call_sid);
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
            caller,
          }),
        );
        // Socket events can precede placement responses.
        const early = takeEarlyOutboundEvents(response.call_sid);
        if (early.providerStatus) {
          dispatch(
            setCallProviderStatus({
              callSid: response.call_sid,
              providerStatus: early.providerStatus,
            }),
          );
        }
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
        if (attempt === placingAttempt) dispatch(setPlacingCall(null));
      }
    },
  ),

  joinCall: createAsyncThunk<JoinCallResult, string, { state: RootState }>(
    'calls/joinCall',
    async (callSid, { getState, dispatch }) => {
      if (selectIsJoining(getState())) return { status: 'locked' };
      if (isSessionClosing()) return { status: 'already_ended' };
      const found = findCall(getState(), callSid);
      if (!found) return { status: 'already_ended' };
      const call = {
        ...found,
        accountId: found.accountId ?? selectCurrentUserAccountId(getState()) ?? undefined,
      };

      dispatch(setIsJoining(callSid));
      if (call.callDirection === 'inbound' && selectPlacingCall(getState())) {
        await dispatch(callActions.cancelPlacingCall());
      }
      await dispatch(callActions.releaseLocalCall(callSid));
      dispatch(markLocalCall(callSid));
      let media: number | undefined;
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
          const attemptId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
          conferenceJoin = CallService.joinConference({ ...conference, attemptId });
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
          if (isJoinCancelled(callSid)) {
            await CallService.leaveConference(conference).catch(() => {});
            dispatch(clearLocalCall(callSid));
            return { status: 'already_ended' };
          }
          await callEngine.twilio.connect(token.token, {
            To: joined.conference_sid,
            is_agent: 'true',
            conversation_id: String(call.conversationId),
            call_sid: callSid,
            attempt_id: attemptId,
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
        if (isJoinCancelled(callSid)) {
          dispatch(clearLocalCall(callSid));
          return { status: 'already_ended' };
        }

        const answering = callEngine.whatsapp.createAnswer(sdpOffer, iceServers);
        media = callEngine.session();
        const sdpAnswer = await answering;
        if (isJoinCancelled(callSid)) {
          await callEngine.hangup('whatsapp', media).catch(() => {});
          dispatch(clearLocalCall(callSid));
          return { status: 'already_ended' };
        }
        try {
          await CallService.acceptWhatsappCall(call.callId, sdpAnswer, call.accountId);
        } catch (error) {
          await callEngine.hangup('whatsapp', media);
          if (httpStatus(error) === 409) {
            dispatch(dismissCall(callSid));
            dispatch(clearLocalCall(callSid));
            const message = (error as { response?: { data?: { error?: string } } }).response?.data
              ?.error;
            return message?.includes('ended')
              ? { status: 'already_ended' }
              : { status: 'answered_elsewhere' };
          }
          // Unacknowledged answers can still succeed server-side.
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
        const abandoned = isJoinCancelled(callSid);
        if (!abandoned) console.error('Failed to join call:', error);
        if (call.provider === VOICE_CALL_PROVIDERS.WHATSAPP) {
          if (media !== undefined) await callEngine.hangup('whatsapp', media).catch(() => {});
        } else {
          await callEngine.twilio.disconnect().catch(() => {});
          // Token failure does not undo acceptance.
          const joinedConference = conference;
          conferenceJoin
            ?.then(() => joinedConference && CallService.leaveConference(joinedConference))
            .catch(() => {});
        }
        dispatch(clearLocalCall(callSid));
        if (abandoned) return { status: 'already_ended' };
        throw error;
      } finally {
        dispatch(setIsJoining(false));
      }
    },
  ),

  cancelPlacingCall: createAsyncThunk<void, void, { state: RootState }>(
    'calls/cancelPlacingCall',
    async (_, { dispatch }) => {
      cancelledAttempts.add(placingAttempt);
      dispatch(setPlacingCall(null));
      await callEngine.whatsapp.hangup().catch(() => {});
    },
  ),

  endCall: createAsyncThunk<void, void, { state: RootState }>(
    'calls/endCall',
    async (_, { getState, dispatch }) => {
      const call = selectActiveCall(getState());
      if (!call) return;
      dispatch(markCallDismissed(call.callSid));
      dispatch(clearActiveCall());
      dispatch(clearLocalCall(call.callSid));
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

  endLocalCalls: createAsyncThunk<void, void, { state: RootState }>(
    'calls/endLocalCalls',
    async (_, { getState, dispatch }) => {
      if (selectPlacingCall(getState())) await dispatch(callActions.cancelPlacingCall());
      await closeSession(
        () => dispatch(callActions.releaseLocalCall('')),
        () =>
          Promise.all([
            callEngine.whatsapp.hangup().catch(() => {}),
            callEngine.twilio.disconnect().catch(() => {}),
          ]),
      );
    },
  ),

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
