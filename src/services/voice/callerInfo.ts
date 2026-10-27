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
  channelType: string;
  medium: string;
};

// Conversation IDs are scoped per account.
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
