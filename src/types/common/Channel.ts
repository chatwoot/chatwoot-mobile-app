export type Channel =
  | 'Channel::Whatsapp'
  | 'Channel::WebWidget'
  | 'Channel::TwitterProfile'
  | 'Channel::TwilioSms'
  | 'Channel::Telegram'
  | 'Channel::Sms'
  | 'Channel::Line'
  | 'Channel::FacebookPage'
  | 'Channel::Email'
  | 'Channel::Api'
  | 'Channel::All';

export type AllChannels = Channel | 'All';

export type ChannelCollection = {
  name: string;
  type: AllChannels;
  icon: React.ReactNode;
};

export const InboxTypes = {
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

export const getRandomChannel = () => {
  const channels = Object.values(InboxTypes);
  return channels[Math.floor(Math.random() * channels.length)];
};
