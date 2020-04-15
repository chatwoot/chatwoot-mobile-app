import md5 from 'md5';
import { GRAVATAR_URL } from '../constants/url';
import { Linking } from 'react-native';

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
    (chatMessage) =>
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
      .replace(/../g, (value) =>
        (
          '0' +
          Math.min(255, Math.max(0, parseInt(value, 16) + -20)).toString(16)
        ).substr(-2),
      )
  );
};

export const checkImageExist = ({ thumbnail }) => {
  fetch(thumbnail)
    .then((res) => {
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

export const openURL = ({ URL }) => {
  Linking.openURL(URL);
};

export const getInboxName = ({ inboxes, inboxId }) => {
  const inbox = inboxes.find((item) => item.id === inboxId);

  return inbox ? inbox.name : '';
};
