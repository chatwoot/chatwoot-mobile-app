import React from 'react';

import {
  ApiFilledIcon,
  ChatIcon,
  ChatwootIcon,
  PhoneIcon,
  WebsiteFilledIcon,
  MailFilledIcon,
  TelegramFilledIcon,
  XFilledIcon,
  WhatsAppFilledIcon,
  InstagramFilledIcon,
  MessengerFilledIcon,
  SMSFilledIcon,
} from '@/svg-icons';

import { InboxTypes } from '@/types';
import { LineFilledIcon } from '@/svg-icons/channels/Line';

const isTwilioChannel = (channelType: string) => {
  return channelType === InboxTypes.TWILIO;
};

const isFacebookChannel = (channelType: string) => {
  return channelType === InboxTypes.FB;
};

const isATwilioSMSChannel = (channelType: string, medium: string) => {
  return isTwilioChannel(channelType) && medium === 'sms';
};

const isAWhatsAppChannel = (channelType: string) => {
  return channelType === InboxTypes.WHATSAPP;
};

const includesAny = (value: string, terms: string[]) => {
  return terms.some(term => value.includes(term));
};

const includesChannelWord = (value: string, term: string) => {
  return new RegExp(`(^|[\\s(:_-])${term}($|[\\s):_-])`).test(value);
};

export const getChannelIcon = (
  channelType: string,
  medium = '',
  additionalType = '',
  visualHint = '',
) => {
  const iconContext = `${channelType} ${medium} ${additionalType} ${visualHint}`.toLowerCase();

  if (isFacebookChannel(channelType)) {
    if (additionalType === 'instagram_direct_message') {
      return <InstagramFilledIcon />;
    }
    return <MessengerFilledIcon />;
  }

  if (channelType === InboxTypes.API) {
    return <ApiFilledIcon />;
  }

  if (channelType === 'Channel::BlueBubbles' || channelType === 'BlueBubbles') {
    if (includesChannelWord(iconContext, 'line')) {
      return <LineFilledIcon />;
    }

    if (includesAny(iconContext, ['whatsapp'])) {
      return <WhatsAppFilledIcon />;
    }

    if (includesAny(iconContext, ['facebook', 'messenger'])) {
      return <MessengerFilledIcon />;
    }

    if (includesAny(iconContext, ['instagram'])) {
      return <InstagramFilledIcon />;
    }

    if (includesAny(iconContext, ['telegram'])) {
      return <TelegramFilledIcon />;
    }

    if (includesAny(iconContext, ['email', 'mail', 'gmail'])) {
      return <MailFilledIcon />;
    }

    if (includesAny(iconContext, ['bluebubbles', 'imessage', 'wechat'])) {
      return <ChatIcon />;
    }

    if (includesAny(iconContext, ['phone', 'sms', 'twilio', 'openphone'])) {
      return <PhoneIcon />;
    }
  }

  if (isTwilioChannel(channelType)) {
    if (isATwilioSMSChannel(channelType, medium)) {
      return <SMSFilledIcon />;
    }
    return <WhatsAppFilledIcon />;
  }

  if (isAWhatsAppChannel(channelType)) {
    return <WhatsAppFilledIcon />;
  }

  if (channelType === InboxTypes.WEB) {
    return <WebsiteFilledIcon />;
  }

  if (channelType === InboxTypes.EMAIL) {
    return <MailFilledIcon />;
  }

  if (channelType === InboxTypes.TELEGRAM) {
    return <TelegramFilledIcon />;
  }

  if (channelType === InboxTypes.LINE) {
    return <LineFilledIcon />;
  }

  if (channelType === InboxTypes.SMS) {
    return <SMSFilledIcon />;
  }

  if (channelType === InboxTypes.TWITTER) {
    return <XFilledIcon />;
  }

  return <ChatwootIcon />;
};
