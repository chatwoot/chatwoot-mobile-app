import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import { VOICE_CALL_STATUS } from '@/constants';
import { ConversationService } from '@/store/conversation/conversationService';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { addConversation, addOrUpdateMessage } from '@/store/conversation/conversationSlice';
import { extractCallData } from '@/utils/voiceCallRouting';
import { selectCurrentUserAvailability } from '@/store/auth/authSelectors';

import { CallService, type RingingCallResponse } from './callService';
import { addCall } from './callSlice';
import { selectCalls, selectDismissedCallSids, selectLocalCallSid } from './callSelectors';

export type SyncRingingCallsResult = {
  found: number;
  ended: { callSid: string; status: string | null }[];
};

// Reconciling this device's ring state with the server
export const callSyncActions = {
  // Asks the server which calls are ringing for this agent and surfaces them. Calls this
  // device still shows as ringing but the server has moved on from are returned, so the OS
  // call UI can be ended before they are removed.
  syncRingingCalls: createAsyncThunk<SyncRingingCallsResult, void, { state: RootState }>(
    'calls/syncRingingCalls',
    async (_, { getState, dispatch }) => {
      let ringing: RingingCallResponse[];
      try {
        ringing = await CallService.getRingingCalls();
      } catch {
        return syncFromConversations(getState, dispatch);
      }
      const dismissed = selectDismissedCallSids(getState());
      // Only inbound rings are surfaced, and only to an agent who is online, as over the
      // socket; an outbound call belongs to the device that placed it, which already has it
      const online = selectCurrentUserAvailability(getState()) === 'online';
      ringing
        .filter(call => online && call.direction === 'inbound' && !dismissed.includes(call.call_id))
        .forEach(call =>
          dispatch(
            addCall({
              callSid: call.call_id,
              callId: call.id,
              provider: call.provider,
              conversationId: call.conversation.display_id,
              inboxId: call.inbox.id,
              callDirection: call.direction,
              caller: call.contact
                ? {
                    name: call.contact.name ?? undefined,
                    phone: call.contact.phone_number ?? undefined,
                    avatar: call.contact.avatar ?? undefined,
                  }
                : null,
              addedAt: call.created_at * 1000,
            }),
          ),
        );
      // A server without this query answers with no ringing calls at all, so a ring this
      // device shows but the list leaves out is checked against its conversation instead
      const ringingSids = new Set(ringing.map(call => call.call_id));
      const localCallSid = selectLocalCallSid(getState());
      const unlisted = selectCalls(getState()).some(
        call =>
          !call.isActive &&
          call.callDirection === 'inbound' &&
          call.callSid !== localCallSid &&
          !ringingSids.has(call.callSid),
      );
      const ended = unlisted
        ? (await syncFromConversations(getState, dispatch)).ended.filter(
            call => !ringingSids.has(call.callSid),
          )
        : [];
      return { found: ringing.length, ended };
    },
  ),
};

// The latest open conversations, with their call messages reconciled: ringing calls are
// surfaced and calls the server has moved on from are returned
const syncFromConversations = async (
  getState: () => RootState,
  dispatch: (action: unknown) => unknown,
): Promise<SyncRingingCallsResult> => {
  const { conversations } = await ConversationService.getConversations({
    status: 'open',
    assigneeType: 'all',
    sortBy: 'latest',
    page: 1,
  });
  const pendingSids = new Set(
    selectCalls(getState())
      .filter(call => !call.isActive && call.callDirection === 'inbound')
      .map(call => call.callSid),
  );
  const localCallSid = selectLocalCallSid(getState());
  let found = 0;
  const ended: SyncRingingCallsResult['ended'] = [];
  conversations.forEach(conversation => {
    const callMessages = (conversation.messages || []).filter(message => message.call);
    const ringingMessages = callMessages.filter(
      message => message.call?.status === VOICE_CALL_STATUS.RINGING,
    );
    const stale = callMessages.filter(message => {
      const { callSid, status } = extractCallData(message);
      return (
        !!callSid &&
        pendingSids.has(callSid) &&
        callSid !== localCallSid &&
        status !== VOICE_CALL_STATUS.RINGING
      );
    });
    if (!ringingMessages.length && !stale.length) return;
    found += ringingMessages.length;
    if (selectConversationById(getState(), conversation.id)) {
      [...ringingMessages, ...stale].forEach(message => dispatch(addOrUpdateMessage(message)));
    } else {
      dispatch(addConversation(conversation));
    }
    stale.forEach(message => {
      const { callSid, status } = extractCallData(message);
      if (callSid) ended.push({ callSid, status: status ?? null });
    });
  });
  return { found, ended };
};
