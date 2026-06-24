import { Channel } from './common/Channel';

export type Inbox = {
  id: number;
  avatarUrl: string;
  channelId: number;
  name: string;
  channelType: Channel;
  email?: string;
  phoneNumber: string;
  medium: string;
  voiceEnabled?: boolean;
  voiceConfigured?: boolean;
  hasApiKeySecret?: boolean;
  webhookUrl?: string | null;
  callbackWebhookUrl?: string | null;
  voiceCallWebhookUrl?: string | null;
  additionalAttributes?: {
    agentReplyTimeWindowMessage?: string;
    type?: string;
    [key: string]: unknown;
  };
  provider: string;
};
