import { INBOX_TYPES } from '@/constants';

export const INBOX_FEATURES = {
  REPLY_TO: 'replyTo',
  REPLY_TO_OUTGOING: 'replyToOutgoing',
};

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

export const is360DialogWhatsAppChannel = (inboxType?: string) => {
  if (!inboxType) {
    return false;
  }
  return inboxType === INBOX_TYPES.WHATSAPP && inboxType === 'default';
};
