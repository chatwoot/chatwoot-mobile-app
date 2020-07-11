import images from './images';

export const CONVERSATION_STATUS = {
  OPEN: 'open',
  RESOLVED: 'resolved',
};

export const MESSAGE_TYPES = {
  INCOMING: 0,
  OUTGOING: 1,
  ACTIVITY: 2,
};

export const MESSAGE_STATUS = {
  SENT: 0,
  DELIVERED: 1,
  READ: 2,
  FAILED: 3,
};

export const ASSIGNEE_TYPE = {
  ME: 'me',
  UN_ASSIGNED: 'unassigned',
  ALL: 'all',
};

export const INBOX_ICON = {
  'Channel::All': 'copy-outline',
  'Channel::WebWidget': 'globe-outline',
  'Channel::TwitterProfile': 'twitter-outline',
  'Channel::FacebookPage': 'facebook-outline',
  'Channel::TwilioSms': 'message-circle-outline',
};

export const INBOX_IMAGES = {
  'Channel::TwitterProfile': images.twitterBadge,
  'Channel::FacebookPage': images.fbBadge,
  'Channel::TwilioSms': images.whatsAppBadge,
};

export const LANGUAGES = {
  en: 'English',
  nl: 'Dutch',
};

export const URL_REGEX = {
  CONVERSATION: 'app/accounts/[-0-9]+/conversations/[-0-9]',
};

export const CONVERSATION_TOGGLE_STATUS = {
  open: 'RESOLVE',
  resolved: 'RE_OPEN',
};
