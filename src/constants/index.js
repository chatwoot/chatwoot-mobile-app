import images from './images';

export const SCREENS = {
  LOGIN: 'Login',
  CONFIG_URL: 'ConfigureURL',
  CONVERSATION: 'ConversationScreen',
  NOTIFICATION: 'NotificationScreen',
  SETTINGS: 'SettingsScreen',
  DETAIL: 'Detail',
  CHAT: 'ChatScreen',
};

export const TAB_BAR_HEIGHT = 83;
export const TEXT_INPUT_CONTAINER_HEIGHT = 57;

export const userStatusList = [
  { statusColor: 'bg-green-800', status: 'online' },
  { statusColor: 'bg-yellow-800', status: 'busy' },
  { statusColor: 'bg-gray-800', status: 'offline' },
];

export const AVAILABILITY_STATUS_LIST = [
  { statusColor: 'bg-green-800', status: 'online' },
  { statusColor: 'bg-yellow-800', status: 'busy' },
  { statusColor: 'bg-gray-800', status: 'offline' },
];

export const MAXIMUM_FILE_UPLOAD_SIZE = 10;

export const CONVERSATION_STATUSES = [
  {
    key: 'open',
    name: 'Open',
  },
  {
    key: 'resolved',
    name: 'Resolved',
  },
  {
    key: 'pending',
    name: 'Pending',
  },
  {
    key: 'snoozed',
    name: 'Snoozed',
  },
  {
    key: 'all',
    name: 'All',
  },
];
export const SORT_TYPES = [
  {
    key: 'latest',
    name: 'Latest',
  },
  {
    key: 'sort_on_created_at',
    name: 'Created At',
  },
  {
    key: 'sort_on_priority',
    name: 'Priority',
  },
];

export const ASSIGNEE_TYPES = [
  {
    key: 'mine',
    name: 'Mine',
  },
  {
    key: 'unassigned',
    name: 'Unassigned',
  },
  {
    key: 'all',
    name: 'All',
  },
];

export const CONVERSATION_STATUS = {
  OPEN: 'open',
  RESOLVED: 'resolved',
  BOT: 'bot',
  PENDING: 'pending',
  SNOOZED: 'snoozed',
  ALL: 'all',
};

export const MESSAGE_TYPES = {
  INCOMING: 0,
  OUTGOING: 1,
  ACTIVITY: 2,
  TEMPLATE: 3,
};

export const MESSAGE_STATUS = {
  FAILED: 'failed',
  SENT: 'sent',
  PROGRESS: 'progress',
  DELIVERED: 'delivered',
  READ: 'read',
};

export const ASSIGNEE_TYPE = {
  ME: 'me',
  UN_ASSIGNED: 'unassigned',
  ALL: 'all',
};

export const SLA_MISS_TYPES = {
  FRT: 'frt',
  NRT: 'nrt',
  RT: 'rt',
};

export const INBOX_TYPES = {
  WEB: 'Channel::WebWidget',
  FB: 'Channel::FacebookPage',
  TWITTER: 'Channel::TwitterProfile',
  TWILIO: 'Channel::TwilioSms',
  WHATSAPP: 'Channel::Whatsapp',
  API: 'Channel::Api',
  EMAIL: 'Channel::Email',
  TELEGRAM: 'Channel::Telegram',
  LINE: 'Channel::Line',
  SMS: 'Channel::Sms',
};

export const INBOX_FEATURES = {
  REPLY_TO: 'replyTo',
  REPLY_TO_OUTGOING: 'replyToOutgoing',
};

export const INBOX_ICON = {
  'Channel::All': 'copy-outline',
  'Channel::Api': 'inbox-outline',
  'Channel::Email': 'email-outline',
  'Channel::WebWidget': 'globe-outline',
  'Channel::TwitterProfile': 'twitter-outline',
  'Channel::FacebookPage': 'facebook-outline',
  'Channel::TwilioSms': 'message-square-outline',
  'Channel::Telegram': 'paper-plane-outline',
  'Channel::Line': 'message-circle-outline',
};

export const INBOX_IMAGES = {
  'Channel::TwitterProfile': images.twitterBadge,
  'Channel::FacebookPage': images.messengerBadge,
  'Channel::TwilioSms': images.whatsAppBadge,
};

export const LANGUAGES = {
  af: 'Afrikaans',
  ar: 'Arabic',
  id: 'Bahasa Indonesia',
  ca: 'Catalan',
  cs: 'Czech',
  da: 'Danish',
  de: 'German',
  en: 'English',
  el: 'Greek',
  es: 'Spanish',
  fa: 'Farsi',
  fi: 'Finnish',
  fr: 'French',
  hu: 'Hungarian',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  ml: 'Malayalam',
  nl: 'Dutch',
  no: 'Norwegian',
  pl: 'Polish',
  pt_BR: 'Portuguese (Brazil)',
  pt: 'Portuguese (Portugal)',
  ro: 'Romanian',
  ru: 'Russian',
  sr: 'Serbian',
  sv: 'Swedish',
  ta: 'Tamil',
  tr: 'Turkish',
  uk: 'Ukrainian',
  vi: 'Vietnamese',
  zh: 'Chinese',
};

export const URL_REGEX = {
  CONVERSATION: 'app/accounts/[-0-9]+/conversations/[-0-9]',
};

export const CONVERSATION_TOGGLE_STATUS = {
  open: 'RESOLVE',
  resolved: 'RE_OPEN',
};

export const PRESENCE_STATUS_COLORS = {
  online: '#44ce4b',
  busy: '#ffc532',
  offline: '#779bbb',
};

export const AVAILABILITY_TYPES = {
  online: 'ONLINE',
  busy: 'BUSY',
  offline: 'OFFLINE',
};

export const CONVERSATION_PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  LOW: 'low',
  MEDIUM: 'medium',
};

export const CONVERSATION_PRIORITY_ORDER = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
  null: 5,
};

export const NOTIFICATION_PREFERENCE_TYPES = {
  push_conversation_creation: 'CONVERSATION_CREATE_PUSH',
  push_conversation_assignment: 'CONVERSATION_ASSIGNEE_PUSH',
  push_assigned_conversation_new_message: 'CONVERSATION_ASSIGNED_NEW_MESSAGE_PUSH',
  push_conversation_mention: 'CONVERSATION_MENTION',
  push_participating_conversation_new_message: 'CONVERSATION_PARTICIPATING_NEW_MESSAGE_PUSH',
  push_sla_missed_first_response: 'CONVERSATION_SLA_MISSED_FIRST_RESPONSE',
  push_sla_missed_next_response: 'CONVERSATION_SLA_MISSED_NEXT_RESPONSE',
  push_sla_missed_resolution: 'CONVERSATION_SLA_MISSED_RESOLUTION',
};

export const NOTIFICATION_TYPES = [
  'conversation_creation',
  'conversation_assignment',
  'assigned_conversation_new_message',
  'conversation_mention',
  'participating_conversation_new_message',
  'sla_missed_first_response',
  'sla_missed_next_response',
  'sla_missed_resolution',
];

export const URL_WITHOUT_HTTP_REGEX =
  /([\w+]+\:\/\/)?([\w\d-]+\.)*[\w-]+[\.\:]\w+([\/\?\=\&\#\.]?[\w-]+)*\/?/gm;

export const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const TEXT_MAX_WIDTH = 300;

export const MESSAGE_MAX_LENGTH = {
  GENERAL: 10000,
  FACEBOOK: 1000,
  TWILIO_SMS: 320,
  TWILIO_WHATSAPP: 1600,
  EMAIL: 25000,
};

export const REPLY_EDITOR_MODES = {
  REPLY: 'REPLY',
  NOTE: 'NOTE',
};

export const ATTACHMENT_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  FILE: 'file',
  LOCATION: 'location',
  FALLBACK: 'fallback',
  SHARE: 'share',
  STORY_MENTION: 'story_mention',
  CONTACT: 'contact',
  IG_REEL: 'ig_reel',
};

export const MEDIA_TYPES = [
  ATTACHMENT_TYPES.IMAGE,
  ATTACHMENT_TYPES.VIDEO,
  ATTACHMENT_TYPES.AUDIO,
  ATTACHMENT_TYPES.IG_REEL,
];
