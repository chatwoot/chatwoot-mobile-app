import type { Inbox } from '@/types/Inbox';

export const inbox: Inbox = {
  id: 1,
  avatarUrl: 'https://example.com/avatar.png',
  channelId: 1,
  name: 'Test Inbox',
  channelType: 'Channel::WebWidget',
  phoneNumber: '+1234567890',
  medium: 'web',
};

export const mockInboxesResponse = { data: { payload: [inbox] } };
