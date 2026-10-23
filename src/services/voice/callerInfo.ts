import type { RootState } from '@/store';
import type { LiveCall } from '@/store/call/callTypes';
import { selectCurrentUserAccountId } from '@/store/auth/authSelectors';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import i18n from '@/i18n';

export type CallerInfo = {
  name: string;
  phone: string;
  avatar: string;
  inboxName: string;
  // What kind of inbox the call came through, which picks its icon
  channelType: string;
  medium: string;
};

// Who is on the call, from the call itself first and the conversation's contact otherwise.
// Conversations and inboxes are looked up only in the call's own account, since their ids
// are per account and the store holds the account on screen.
export const selectCallerInfo = (state: RootState, call: LiveCall | null): CallerInfo => {
  const inCurrentAccount =
    call?.accountId == null || Number(call.accountId) === Number(selectCurrentUserAccountId(state));
  const conversation =
    inCurrentAccount && call?.conversationId
      ? selectConversationById(state, call.conversationId)
      : undefined;
  const inbox =
    inCurrentAccount && call?.inboxId ? selectInboxById(state, call.inboxId) : undefined;
  const contact = conversation?.meta?.sender;
  return {
    name: call?.caller?.name || contact?.name || i18n.t('CONVERSATION.VOICE_WIDGET.UNKNOWN_CALLER'),
    phone: call?.caller?.phone || contact?.phoneNumber || '',
    avatar: call?.caller?.avatar || contact?.thumbnail || '',
    inboxName: inbox?.name || '',
    channelType: inbox?.channelType || '',
    medium: inbox?.medium || '',
  };
};
