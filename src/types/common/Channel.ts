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
  | 'Channel::Api';

export type AllChannels = Channel | 'All';

export type ChannelCollection = {
  name: string;
  type: AllChannels;
  icon: React.ReactNode;
};
