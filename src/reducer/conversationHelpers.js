import { MESSAGE_TYPES } from 'constants';
import { findPendingMessageIndex } from '../helpers/conversationHelpers';

export const addOrUpdateMessageHelper = (state, message) => {
  const { conversation_id: conversationId } = message;
  if (!conversationId) {
    return;
  }
  const conversation = state.entities[conversationId];

  if (!conversation) {
    return;
  }
  if (message.message_type === MESSAGE_TYPES.INCOMING) {
    conversation.can_reply = true;
  }
  const pendingMessageIndex = findPendingMessageIndex(conversation, message);
  if (pendingMessageIndex !== -1) {
    conversation.messages[pendingMessageIndex] = message;
  } else {
    conversation.messages.push(message);
    conversation.timestamp = message.created_at;
    const { conversation: { unread_count: unreadCount = 0 } = {} } = message;
    conversation.unread_count = unreadCount;
  }
};
