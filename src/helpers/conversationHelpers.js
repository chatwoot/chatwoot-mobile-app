import { MESSAGE_STATUS, MESSAGE_TYPES } from 'constants';
import DateHelper from './DateHelper';

const groupBy = require('lodash.groupby');

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

export const replaceMentionsWithUsernames = text => {
  // eslint-disable-next-line no-useless-escape
  const regex = /\[@([^\]]+)\]\(mention:\/\/user\/\d+\/([^\)]+)\)/g;
  const matches = text.matchAll(regex);
  let result = text;
  for (const match of matches) {
    const [fullMatch, username] = match;
    const replacement = `@${decodeURIComponent(username)}`;
    result = result.replace(fullMatch, replacement);
  }
  return result;
};

export const findUniqueMessages = ({ allMessages }) => {
  const completeMessages = []
    .concat(allMessages)
    .sort((a, b) => a.created_at - b.created_at)
    .reverse();

  const uniqueMessages = completeMessages.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  return uniqueMessages;
};

export const getGroupedMessages = ({ messages }) => {
  const conversationGroupedByDate = groupBy(Object.values(messages), message =>
    new DateHelper(message.created_at).format(),
  );
  return Object.keys(conversationGroupedByDate).map(date => {
    const groupedMessages = conversationGroupedByDate[date].map((message, index) => {
      let showAvatar = false;
      if (index === conversationGroupedByDate[date].length - 1) {
        showAvatar = true;
      } else {
        const nextMessage = conversationGroupedByDate[date][index + 1];
        const currentSender = message.sender ? message.sender.name : '';
        const nextSender = nextMessage.sender ? nextMessage.sender.name : '';
        showAvatar =
          currentSender !== nextSender || message.message_type !== nextMessage.message_type;
      }
      return { showAvatar, ...message };
    });

    return {
      data: groupedMessages,
      date,
    };
  });
};

export const getTypingUsersText = ({ conversationId, conversationTypingUsers }) => {
  const userList = conversationTypingUsers[conversationId];
  const isAnyoneTyping = userList && userList.length !== 0;
  if (isAnyoneTyping) {
    const count = userList.length;
    if (count === 1) {
      const [user] = userList;
      const { type } = user;
      // Check user is typing
      if (type === 'contact') {
        return 'typing...';
      }
      return `${user.name.toString().replace(/^./, str => str.toUpperCase())} is typing...`;
    }

    if (count === 2) {
      const [first, second] = userList;
      return `${first.name.toString().replace(/^./, str => str.toUpperCase())} and ${second.name
        .toString()
        .replace(/^./, str => str.toUpperCase())} are typing...`;
    }

    const [user] = userList;
    const rest = userList.length - 1;
    return `${user.name
      .toString()
      .replace(/^./, str => str.toUpperCase())} and ${rest} others are typing...`;
  }
  return false;
};

export const extractConversationIdFromUrl = ({ url }) => {
  try {
    const conversationIdMatch = url.match(/\/conversations\/(\d+)/);
    const conversationId = conversationIdMatch ? parseInt(conversationIdMatch[1]) : null;
    return conversationId;
  } catch (error) {
    return null;
  }
};
