import { MESSAGE_TYPES, ORIENTATION } from '@/constants';

// Only what the contact sent sits on the left. Everything sent from the business side (any agent,
// a bot, automation, templates, private notes) sits on the right, as on the web dashboard.
export const getMessageOrientation = (messageType: number): string => {
  if (messageType === MESSAGE_TYPES.ACTIVITY) return ORIENTATION.CENTER;
  if (messageType === MESSAGE_TYPES.INCOMING) return ORIENTATION.LEFT;
  return ORIENTATION.RIGHT;
};

// The signed-in agent's own bubbles carry no avatar; every other sender's do.
export const shouldShowSenderAvatar = (messageType: number, isMyMessage: boolean): boolean =>
  messageType !== MESSAGE_TYPES.ACTIVITY && !isMyMessage;
