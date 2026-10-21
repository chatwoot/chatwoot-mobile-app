import type { VoiceCallProvider } from '@/types';
import type { Inbox } from '@/types/Inbox';
import { getVoiceCallProvider } from '@/utils/inboxUtils';

export type ContactCallOption =
  | {
      type: 'inbox';
      inbox: Inbox;
      provider: VoiceCallProvider;
      // The conversation the call continues in, when it is in this inbox
      conversationId?: number;
    }
  | { type: 'dialer' };

// The ways to call a contact: each inbox that can place a call, the one of the
// conversation on screen first, then the phone's own dialer. Without a phone number only
// a WhatsApp conversation on screen can be called, through the identity it already has.
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
