import md5 from 'md5';

import { GRAVATAR_URL } from '../constants/url';

import DateHelper from './DateHelper';
import { ASSIGNEE_TYPE, CONVERSATION_STATUS } from '../constants';

const groupBy = require('lodash.groupby');

export function findAssigneeType({ assigneeType }) {
  let assignee;
  switch (assigneeType) {
    case 0:
      assignee = ASSIGNEE_TYPE.ME;
      break;
    case 1:
      assignee = ASSIGNEE_TYPE.UN_ASSIGNED;
      break;
    default:
      assignee = ASSIGNEE_TYPE.ALL;
  }
  return assignee;
}

export function findConversationStatus({ conversationStatus }) {
  let status;
  switch (conversationStatus) {
    case CONVERSATION_STATUS.RESOLVED:
      status = CONVERSATION_STATUS.RESOLVED;
      break;
    case CONVERSATION_STATUS.BOT:
      status = CONVERSATION_STATUS.BOT;
      break;
    case CONVERSATION_STATUS.PENDING:
      status = CONVERSATION_STATUS.PENDING;
      break;
    case CONVERSATION_STATUS.SNOOZED:
      status = CONVERSATION_STATUS.SNOOZED;
      break;

    default:
      status = CONVERSATION_STATUS.OPEN;
  }
  return status;
}

export function checkConversationMatch({
  assignee,
  user,
  assigneeType,
  status,
  conversationStatus,
}) {
  const { email: userEmail } = user;
  if (conversationStatus !== status) {
    return false;
  }
  if (!assignee && assigneeType !== 1) {
    return false;
  }
  if (assignee && assignee.email && userEmail !== assignee.email && assigneeType === 0) {
    return false;
  }
  return true;
}

export function getUserInitial({ userName }) {
  const parts = userName ? userName.split(/[ -]/) : [];
  let initials = '';
  for (let i = 0; i < parts.length; i += 1) {
    initials += parts[i].charAt(0);
  }
  if (initials.length > 2 && initials.search(/[A-Z]/) !== -1) {
    initials = initials.replace(/[a-z]+/g, '');
  }
  initials = initials.substr(0, 2).toUpperCase();
  return initials;
}

export function getGravatarUrl({ email }) {
  const hash = md5(email);
  return `${GRAVATAR_URL}${hash}?default=404`;
}

export function findLastMessage({ messages }) {
  let [last] = messages.slice(-1);

  return last;
}

export function getUnreadCount(conversation) {
  return conversation.messages.filter(
    chatMessage =>
      chatMessage.created_at * 1000 > conversation.agent_last_seen_at * 1000 &&
      chatMessage.message_type === 0 &&
      chatMessage.private !== true,
  ).length;
}

export const getRandomColor = function ({ userName }) {
  let hash = 0;

  for (let i = 0; i < userName.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';

  for (let i = 0; i < 3; i++) {
    // eslint-disable-next-line no-bitwise
    let value = (hash >> (i * 8)) & 0xff;

    color += ('00' + value.toString(16)).substr(-2);
  }

  return (
    '#' +
    color
      .replace(/^#/, '')
      .replace(/../g, value =>
        ('0' + Math.min(255, Math.max(0, parseInt(value, 16) + -20)).toString(16)).substr(-2),
      )
  );
};

export const checkImageExist = ({ thumbnail }) => {
  fetch(thumbnail)
    .then(res => {
      if (res.status === 404) {
        return false;
      } else {
        return true;
      }
    })
    .catch(() => {
      return false;
    });
};

export const getInboxName = ({ inboxes, inboxId }) => {
  const inbox = inboxes.find(item => item.id === inboxId);
  return inbox ? inbox.name : null;
};

export const getGroupedConversation = ({ conversations }) => {
  const conversationGroupedByDate = groupBy(Object.values(conversations), message =>
    new DateHelper(message.created_at).format(),
  );
  return Object.keys(conversationGroupedByDate).map(date => {
    const messages = conversationGroupedByDate[date].map((message, index) => {
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
      data: messages,
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

export const getGroupedNotifications = ({ notifications }) => {
  const notificationGroupedByDate = groupBy(Object.values(notifications), notification =>
    new DateHelper(notification.created_at).format(),
  );
  return Object.keys(notificationGroupedByDate).map(date => {
    const data = notificationGroupedByDate[date];

    return {
      data,
      title: date,
    };
  });
};

export const findUniqueConversations = ({ payload }) => {
  const filterConversations = payload.filter(item => item.messages.length !== 0);
  const uniqueConversations = filterConversations.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  return uniqueConversations;
};

export const findUniqueMessages = ({ allMessages }) => {
  const completeMessages = [].concat(allMessages).reverse();

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

export const addOrRemoveItemFromArray = (array, key) => {
  const index = array.findIndex(o => o === key);
  if (index === -1) {
    array.push(key);
  } else {
    array.splice(index, 1);
  }
  return array;
};

export const getCustomerDetails = ({ conversationMetaDetails, conversationDetails }) => {
  const customer = {
    name: null,
    thumbnail: null,
  };

  if (conversationMetaDetails) {
    const {
      sender: { name, thumbnail },
      channel,
    } = conversationMetaDetails;
    customer.name = name;
    customer.thumbnail = thumbnail;
    customer.channel = channel;
  } else if (conversationDetails) {
    const {
      sender: { name, thumbnail },
      channel,
    } = conversationDetails.meta;
    customer.name = name;
    customer.thumbnail = thumbnail;
    customer.channel = channel;
  }
  return customer;
};
