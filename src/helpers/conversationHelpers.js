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

export const getInboxName = ({ inboxes, inboxId }) => {
  const inbox = inboxes.find(item => item.id === inboxId);
  return inbox ? inbox : {};
};

const getLastNonActivityMessage = (messageInStore, messageFromAPI) => {
  // If both API value and store value for last non activity message
  // are available, then return the latest one.
  if (messageInStore && messageFromAPI) {
    if (messageInStore.created_at >= messageFromAPI.created_at) {
      return messageInStore;
    }
    return messageFromAPI;
  }

  // Otherwise, return whichever is available
  return messageInStore || messageFromAPI;
};

export function findLastMessage(m) {
  let lastMessageIncludingActivity = m.messages[m.messages.length - 1];

  const nonActivityMessages = m.messages.filter(message => message.message_type !== 2);
  let lastNonActivityMessageInStore = nonActivityMessages[nonActivityMessages.length - 1];
  let lastNonActivityMessageFromAPI = m.last_non_activity_message;
  if (!lastNonActivityMessageInStore && !lastNonActivityMessageFromAPI) {
    return lastMessageIncludingActivity;
  }
  return getLastNonActivityMessage(lastNonActivityMessageInStore, lastNonActivityMessageFromAPI);
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
