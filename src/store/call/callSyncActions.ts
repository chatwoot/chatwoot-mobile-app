import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import { VOICE_CALL_STATUS } from '@/constants';
import { ConversationService } from '@/store/conversation/conversationService';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { addConversation, addOrUpdateMessage } from '@/store/conversation/conversationSlice';
import { extractCallData } from '@/utils/voiceCallRouting';

import { markCallDismissed, removeCall } from './callSlice';
import { selectCalls, selectLocalCallSid } from './callSelectors';

export type SyncRingingCallsResult = {
  found: number;
  ended: { callSid: string; status: string | null }[];
};

// Reconciling this device's ring state with the server
export const callSyncActions = {
  // Fetches the latest open conversations and reconciles the ring state with the server:
  // calls that are ringing get surfaced, and calls this device still shows as ringing but
  // the server has moved on from are dropped. Returns those so the OS call UI can be ended
  // with the matching reason.
  syncRingingCalls: createAsyncThunk<SyncRingingCallsResult, void, { state: RootState }>(
    'calls/syncRingingCalls',
    async (_, { getState, dispatch }) => {
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
        const ringing = callMessages.filter(
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
        if (!ringing.length && !stale.length) return;
        found += ringing.length;
        if (selectConversationById(getState(), conversation.id)) {
          [...ringing, ...stale].forEach(message => dispatch(addOrUpdateMessage(message)));
        } else {
          dispatch(addConversation(conversation));
        }
        stale.forEach(message => {
          const { callSid, status } = extractCallData(message);
          if (!callSid) return;
          ended.push({ callSid, status: status ?? null });
          dispatch(markCallDismissed(callSid));
          dispatch(removeCall(callSid));
        });
      });
      return { found, ended };
    },
  ),
};
