import { MESSAGE_STATUS, MESSAGE_TYPES } from 'constants';
export const getUuid = () =>
  'xxxxxxxx4xxx'.replace(/[xy]/g, c => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const filterByStatus = (chatStatus, filterStatus) =>
  filterStatus === 'all' ? true : chatStatus === filterStatus;

export const applyFilters = (conversation, filters) => {
  const { inboxId, conversationStatus } = filters;
  const { status: chatStatus, inbox_id: chatInboxId } = conversation;
  let shouldFilter = filterByStatus(chatStatus, conversationStatus);
  if (inboxId) {
    const filterByInbox = Number(inboxId) === chatInboxId;
    shouldFilter = shouldFilter && filterByInbox;
  }

  return shouldFilter;
};

export function getUnreadCount(conversation) {
  const unReadMessages = conversation.messages.filter(
    chatMessage =>
      chatMessage.created_at * 1000 > conversation.agent_last_seen_at * 1000 &&
      chatMessage.message_type === 0 &&
      chatMessage.private !== true,
  );
  const unReadCount = unReadMessages.length;
  return unReadCount > 9 ? '9+' : unReadCount;
}

export const getInboxName = ({ inboxes, inboxId }) => {
  const inbox = inboxes.find(item => item.id === inboxId);
  return inbox ? inbox : {};
};

export function findLastMessage({ messages }) {
  let [lastMessage] = messages.slice(-1);

  if (lastMessage) {
    const { content, created_at, attachments, message_type, private: isPrivate } = lastMessage;
    return {
      content,
      created_at,
      attachments,
      message_type,
      isPrivate,
    };
  }
  return {
    content: '',
    created_at: '',
    attachments: [],
    message_type: '',
    isPrivate: false,
  };
}

export const findPendingMessageIndex = (conversation, message) => {
  const { echo_id: tempMessageId } = message;
  return conversation.messages.findIndex(m => m.id === message.id || m.id === tempMessageId);
};

export const createPendingMessage = data => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const tempMessageId = getUuid();

  const { message, file } = data;
  const tempAttachments = [{ id: tempMessageId }];
  const pendingMessage = {
    ...data,
    content: message || null,
    id: tempMessageId,
    echo_id: tempMessageId,
    status: MESSAGE_STATUS.PROGRESS,
    created_at: timestamp,
    message_type: MESSAGE_TYPES.OUTGOING,
    conversation_id: data.conversationId,
    attachments: file ? tempAttachments : null,
  };

  return pendingMessage;
};

export const buildCreatePayload = ({
  conversationId,
  message,
  private: isPrivate,
  contentAttributes,
  echo_id: echoId,
  file,
  ccEmails = '',
  bccEmails = '',
  templateParams,
}) => {
  let payload;
  if (file) {
    payload = new FormData();
    if (message) {
      payload.append('content', message);
    }
    payload.append('attachments[]', {
      uri: file.uri,
      name: file.fileName,
      type: file.type,
    });
    payload.append('private', isPrivate);
    payload.append('echo_id', echoId);
    payload.append('cc_emails', ccEmails);
    payload.append('bcc_emails', bccEmails);
  } else {
    payload = {
      content: message,
      private: isPrivate,
      echo_id: echoId,
      content_attributes: contentAttributes,
      cc_emails: ccEmails,
      bcc_emails: bccEmails,
      template_params: templateParams,
    };
  }
  return payload;
};
