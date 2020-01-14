import md5 from 'md5';
import { GRAVATAR_URL } from '../constants/url';

import { MESSAGE_TYPES } from '../constants';

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
  const lastMessage = messages.find(element => {
    return element.message_type !== MESSAGE_TYPES.ACTIVITY;
  });
  return lastMessage;
}
