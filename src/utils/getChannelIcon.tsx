import React from 'react';

import {
  ChatwootIcon,
  WebsiteFilledIcon,
  MailFilledIcon,
  TelegramFilledIcon,
  XFilledIcon,
  WhatsAppFilledIcon,
  InstagramFilledIcon,
  MessengerFilledIcon,
  SMSFilledIcon,
} from '@/svg-icons';

import { Channel, InboxTypes } from '@/types';
import { LineFilledIcon } from '@/svg-icons/channels/Line';

const isTwilioChannel = (channelType: Channel) => {
  return channelType === InboxTypes.TWILIO;
};

const isFacebookChannel = (channelType: Channel) => {
  return channelType === InboxTypes.FB;
};

const isATwilioSMSChannel = (channelType: Channel, medium: string) => {
  return isTwilioChannel(channelType) && medium === 'sms';
};

const isAWhatsAppChannel = (channelType: Channel) => {
  return channelType === InboxTypes.WHATSAPP;
};

export const getChannelIcon = (channelType: Channel, medium: string, additionalType: string) => {
  if (isFacebookChannel(channelType)) {
    if (additionalType === 'instagram_direct_message') {
      return <InstagramFilledIcon />;
    }
    return <MessengerFilledIcon />;
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
