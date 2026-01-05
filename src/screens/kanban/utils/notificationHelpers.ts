import { MESSAGE_TYPES } from '@/constants';
import { Conversation } from '@/types/Conversation';

export function countUnreadIncomingMessages(conversation: Conversation | null): number {
  if (!conversation) return 0;

  const { messages, agentLastSeenAt } = conversation;

  if (!messages || messages.length === 0) return 0;

  const unreadIncomingCount = messages.filter(message => {
    const isIncoming = message.messageType === MESSAGE_TYPES.INCOMING;
    const isUnread = agentLastSeenAt ? message.createdAt > agentLastSeenAt : true;

    return isIncoming && isUnread;
  }).length;

  return unreadIncomingCount;
}

export function hasUnreadIncomingMessages(conversation: Conversation | null): boolean {
  return countUnreadIncomingMessages(conversation) > 0;
}

export function separateConversationsByNotifications(conversations: Conversation[]) {
  const withNotifications: Conversation[] = [];
  const withoutNotifications: Conversation[] = [];

  conversations.forEach(conversation => {
    if (hasUnreadIncomingMessages(conversation)) {
      withNotifications.push(conversation);
    } else {
      withoutNotifications.push(conversation);
    }
  });

  return {
    withNotifications,
    withoutNotifications,
  };
}

export function getLastIncomingMessage(conversation: Conversation | null) {
  if (!conversation || !conversation.messages) return null;

  const incomingMessages = conversation.messages.filter(
    message => message.messageType === MESSAGE_TYPES.INCOMING,
  );

  if (incomingMessages.length === 0) return null;

  return incomingMessages[incomingMessages.length - 1];
}
