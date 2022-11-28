import { INBOX_TYPES } from 'src/constants/index';
import images from 'constants/images';

export const getInboxIconByType = ({ channelType, phoneNumber }) => {
  switch (channelType) {
    case INBOX_TYPES.WEB:
      return 'globe-desktop-outline';

    case INBOX_TYPES.FB:
      return 'brand-facebook';

    case INBOX_TYPES.TWITTER:
      return 'brand-twitter';

    case INBOX_TYPES.TWILIO:
      return phoneNumber?.startsWith('whatsapp') ? 'brand-whatsapp' : 'brand-sms';

    case INBOX_TYPES.WHATSAPP:
      return 'brand-whatsapp';

    case INBOX_TYPES.API:
      return 'cloud-outline';

    case INBOX_TYPES.EMAIL:
      return 'mail-outline';

    case INBOX_TYPES.TELEGRAM:
      return 'brand-telegram';

    case INBOX_TYPES.LINE:
      return 'brand-line';

    default:
      return 'chat-outline';
  }
};

export const getInboxBadgeImages = (inbox = {}, chatAdditionalInfo = {}) => {
  const { channel_type: channelType = '', medium = '' } = inbox;
  const { type = '' } = chatAdditionalInfo;

  if (inbox !== {} || chatAdditionalInfo !== {}) {
    if (channelType === INBOX_TYPES.TWILIO) {
      return medium === 'sms' ? images.smsBadge : images.whatsAppBadge;
    }
    if (channelType === INBOX_TYPES.TWITTER) {
      return type === 'tweet' ? images.twitterTweetBadge : images.twitterDMBadge;
    }
    if (channelType === INBOX_TYPES.FB) {
      return type === 'instagram_direct_message' ? images.instagramBadge : images.messengerBadge;
    }
    if (channelType === INBOX_TYPES.LINE) {
      return images.lineBadge;
    }
    if (channelType === INBOX_TYPES.TELEGRAM) {
      return images.telegramBadge;
    }
  }
};
