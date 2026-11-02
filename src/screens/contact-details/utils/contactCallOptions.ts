import type { VoiceCallProvider } from '@/types';
import type { Inbox } from '@/types/Inbox';
import { getVoiceCallProvider } from '@/utils/inboxUtils';

export type ContactCallOption =
  | {
      type: 'inbox';
      inbox: Inbox;
      provider: VoiceCallProvider;
      conversationId?: number;
    }
  | { type: 'dialer' };

// Existing WhatsApp identities need no number.
export const buildContactCallOptions = (
  inboxes: Inbox[],
  conversation?: { id: number; inboxId?: number } | null,
  hasPhoneNumber = true,
): ContactCallOption[] => {
  const inboxOptions = inboxes.flatMap((inbox): ContactCallOption[] => {
    const provider = getVoiceCallProvider(inbox);
    if (!provider) return [];
    const inConversation = !!conversation && conversation.inboxId === inbox.id;
    return [
      {
        type: 'inbox',
        inbox,
        provider,
        ...(inConversation ? { conversationId: conversation.id } : {}),
      },
    ];
  });
  if (!hasPhoneNumber) {
    return inboxOptions.filter(
      option => option.type === 'inbox' && option.conversationId && option.provider === 'whatsapp',
    );
  }
  const ordered = [
    ...inboxOptions.filter(option => option.type === 'inbox' && option.conversationId),
    ...inboxOptions.filter(option => option.type === 'inbox' && !option.conversationId),
  ];
  return [...ordered, { type: 'dialer' }];
};
