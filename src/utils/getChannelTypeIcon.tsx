import React from 'react';

import {
  ChatwootIcon,
  FacebookIcon,
  TelegramIcon,
  WebsiteIcon,
  WhatsAppIcon,
  XIcon,
} from '../svg-icons';
import { Channel } from '../types';

export const getChannelTypeIcon = (type: Channel) => {
  switch (type) {
    case 'Channel::FacebookPage':
      return <FacebookIcon />;
    case 'Channel::Telegram':
      return <TelegramIcon />;
    case 'Channel::WebWidget':
      return <WebsiteIcon />;
    case 'Channel::Whatsapp':
      return <WhatsAppIcon />;
    case 'Channel::TwitterProfile':
      return <XIcon />;
    default:
      return <ChatwootIcon />;
  }
};
