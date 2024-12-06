import { INBOX_TYPES, INBOX_FEATURES } from '@/constants';
import { Inbox } from '@/types/Inbox';

// This is a single source of truth for inbox features
// This is used to check if a feature is available for a particular inbox or not
export const INBOX_FEATURE_MAP = {
  [INBOX_FEATURES.REPLY_TO]: [
    INBOX_TYPES.FB,
    INBOX_TYPES.WEB,
    INBOX_TYPES.TWITTER,
    INBOX_TYPES.WHATSAPP,
    INBOX_TYPES.TELEGRAM,
    INBOX_TYPES.API,
  ],
  [INBOX_FEATURES.REPLY_TO_OUTGOING]: [
    INBOX_TYPES.WEB,
    INBOX_TYPES.TWITTER,
    INBOX_TYPES.WHATSAPP,
    INBOX_TYPES.TELEGRAM,
    INBOX_TYPES.API,
  ],
};

export const inboxHasFeature = (feature: string, inboxType?: string) => {
  if (!inboxType) {
    return false;
  }
  return INBOX_FEATURE_MAP[feature]?.includes(inboxType) ?? false;
};

export const isAWebWidgetInbox = (inbox: Inbox) => {
  return inbox.channelType === INBOX_TYPES.WEB;
};

export const isAFacebookInbox = (inbox: Inbox | undefined) => {
  return inbox?.channelType === INBOX_TYPES.FB;
};

export const isATelegramChannel = (inbox: Inbox) => {
  return inbox.channelType === INBOX_TYPES.TELEGRAM;
};

export const isAnEmailChannel = (inbox: Inbox | undefined) => {
  return inbox?.channelType === INBOX_TYPES.EMAIL;
};

export const isALineChannel = (inbox: Inbox) => {
  return inbox.channelType === INBOX_TYPES.LINE;
};

export const isATwilioChannel = (inbox: Inbox) => {
  return inbox.channelType === INBOX_TYPES.TWILIO;
};

export const isATwilioSMSChannel = (inbox: Inbox | undefined) => {
  return inbox?.channelType === INBOX_TYPES.TWILIO && inbox.medium === 'sms';
};

export const isAWhatsAppChannel = (inbox: Inbox | undefined) => {
  return inbox?.channelType === INBOX_TYPES.WHATSAPP || isATwilioWhatsAppChannel(inbox);
};

export const is360DialogWhatsAppChannel = (inboxType?: string) => {
  if (!inboxType) {
    return false;
  }
  return inboxType === INBOX_TYPES.WHATSAPP && inboxType === 'default';
};

export const isATwilioWhatsAppChannel = (inbox: Inbox | undefined) => {
  return inbox?.channelType === INBOX_TYPES.TWILIO && inbox?.medium === 'whatsapp';
};

export const isAWhatsAppCloudChannel = (inbox: Inbox | undefined) => {
  return (
    inbox?.channelType === INBOX_TYPES.WHATSAPP && whatsAppAPIProvider(inbox) === 'whatsapp_cloud'
  );
};

export const isASmsInbox = (inbox: Inbox | undefined) => {
  return inbox?.channelType === INBOX_TYPES.SMS || isATwilioSMSChannel(inbox);
};

export const whatsAppAPIProvider = (inbox: Inbox) => {
  return inbox.provider || '';
};
