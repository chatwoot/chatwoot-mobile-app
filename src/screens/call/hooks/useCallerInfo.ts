import { useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import type { LiveCall } from '@/store/call/callTypes';

export type CallerInfo = { name: string; phone: string; avatar: string; inboxName: string };

// Who is on the call, from the call itself first and the conversation's contact otherwise
export const useCallerInfo = (call: LiveCall | null): CallerInfo => {
  const conversation = useAppSelector(state =>
    call?.conversationId ? selectConversationById(state, call.conversationId) : undefined,
  );
  const inbox = useAppSelector(state =>
    call?.inboxId ? selectInboxById(state, call.inboxId) : undefined,
  );
  const contact = conversation?.meta?.sender;
  return {
    name: call?.caller?.name || contact?.name || i18n.t('CONVERSATION.VOICE_WIDGET.UNKNOWN_CALLER'),
    phone: call?.caller?.phone || contact?.phoneNumber || '',
    avatar: call?.caller?.avatar || contact?.thumbnail || '',
    inboxName: inbox?.name || '',
  };
};
