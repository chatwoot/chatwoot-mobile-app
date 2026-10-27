import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import { VOICE_CALL_STATUS } from '@/constants';
import { ConversationService } from '@/store/conversation/conversationService';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { addConversation, addOrUpdateMessage } from '@/store/conversation/conversationSlice';
import { extractCallData } from '@/utils/voiceCallRouting';
import {
  selectCurrentUserAccountId,
  selectCurrentUserReceivesCalls,
  selectUserId,
} from '@/store/auth/authSelectors';

import { CallService, type RingingCallResponse } from './callService';
import { addCall } from './callSlice';
import { selectCalls, selectDismissedCallSids, selectLocalCallSid } from './callSelectors';

export type SyncRingingCallsResult = {
  found: number;
  ended: { callSid: string; status: string | null }[];
};

const sessionOf = (state: RootState) =>
  `${selectUserId(state) ?? ''}:${selectCurrentUserAccountId(state) ?? ''}`;

const NOTHING_SYNCED: SyncRingingCallsResult = { found: 0, ended: [] };

export const callSyncActions = {
  syncRingingCalls: createAsyncThunk<SyncRingingCallsResult, void, { state: RootState }>(
    'calls/syncRingingCalls',
    async (_, { getState, dispatch }) => {
      const session = sessionOf(getState());
      const accountId = selectCurrentUserAccountId(getState());
      let ringing: RingingCallResponse[];
      try {
        ringing = await CallService.getRingingCalls();
      } catch {
        return syncFromConversations(getState, dispatch);
      }
      if (sessionOf(getState()) !== session) return NOTHING_SYNCED;
      const dismissed = selectDismissedCallSids(getState());
      const receivesCalls = selectCurrentUserReceivesCalls(getState());
      // Assignments can change after ringing starts.
      const currentUserId = selectUserId(getState());
      const assignedElsewhere = (call: RingingCallResponse) => {
        const assigneeId = selectConversationById(getState(), call.conversation.display_id)?.meta
          ?.assignee?.id;
        return !!assigneeId && !!currentUserId && assigneeId !== currentUserId;
      };
      ringing
        .filter(
          call =>
            receivesCalls &&
            call.direction === 'inbound' &&
            !dismissed.includes(call.call_id) &&
            !assignedElsewhere(call),
        )
        .forEach(call =>
          dispatch(
            addCall({
              callSid: call.call_id,
              callId: call.id,
              provider: call.provider,
              conversationId: call.conversation.display_id,
              inboxId: call.inbox.id,
              accountId: accountId ?? undefined,
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
      // Older servers need conversation-based ring reconciliation.
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

const syncFromConversations = async (
  getState: () => RootState,
  dispatch: (action: unknown) => unknown,
): Promise<SyncRingingCallsResult> => {
  const session = sessionOf(getState());
  const { conversations } = await ConversationService.getConversations({
    status: 'open',
    assigneeType: 'all',
    sortBy: 'latest',
    page: 1,
  });
  if (sessionOf(getState()) !== session) return NOTHING_SYNCED;
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
