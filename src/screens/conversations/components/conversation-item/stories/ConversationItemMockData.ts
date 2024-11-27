import { Channel, ContentType, MessageStatus, MessageType } from '@/types';

export const conversation = {
  senderName: 'Leo Das',
  senderThumbnail: 'https://i.pravatar.cc/300',
  id: 250,
  accountId: 1,
  isTyping: false,
  timestamp: 1732205198,
  firstReplyCreatedAt: 1732118959,
  inbox: {
    id: 1,
    avatarUrl: 'https://example.com/avatar.png',
    channelId: 1,
    name: 'Test Inbox',
    channelType: 'Channel::FacebookPage' as Channel,
    phoneNumber: '+1234567890',
    medium: 'web',
  },
  lastMessage: {
    id: 2346,
    content:
      'Hi there, I accidentally purchased the wrong item. Can I cancel the order and get a refund?',
    attachments: [],
    contentType: 'text' as ContentType,
    conversationId: 250,
    createdAt: 1732205198,
    from: 'John Doe',
    echoId: '123',
    inboxId: 1,
    messageType: 0 as MessageType,
    private: false,
    sourceChannel: 'Channel::FacebookPage' as Channel,
    sourceId: null,
    status: 'sent' as MessageStatus,
    lastNonActivityMessage: null,
    conversation: null,
  },
  slaPolicyId: null,
  appliedSla: null,
  additionalAttributes: {},
  appliedSlaConversationDetails: {},
  labels: [],
  allLabels: [
    { color: '#28AD21', description: '', id: 1, showOnSidebar: true, title: 'billing' },
    { color: '#9C5311', description: '', id: 2, showOnSidebar: true, title: 'lead' },
    { color: '#F85DE2', description: '', id: 3, showOnSidebar: true, title: 'premium-customer' },
    { color: '#8F6EF2', description: '', id: 4, showOnSidebar: true, title: 'software' },
    { color: '#A53326', description: '', id: 5, showOnSidebar: true, title: 'delivery' },
  ],
};

export const conversationWithOneLineMessage = {
  ...conversation,
  lastMessage: {
    ...conversation.lastMessage,
    content: 'Hello, how are you?',
  },
};

export const conversationWithSLA = {
  ...conversation,
  slaPolicyId: 1,
  appliedSla: {
    id: 1,
    slaName: 'SLA 1',
    slaDescription: 'SLA 1 description',
    slaId: 1,
    slaStatus: 'pending',
    createdAt: 1732118959,
    updatedAt: 1732118959,
    slaFirstResponseTimeThreshold: 10,
    slaNextResponseTimeThreshold: 20,
    slaResolutionTimeThreshold: 30,
    slaOnlyDuringBusinessHours: false,
  },
  appliedSlaConversationDetails: {
    firstReplyCreatedAt: 1732118959,
    waitingSince: 1732118959,
    status: 'pending',
  },
};

export const conversationWithLabelAndSLA = {
  ...conversationWithSLA,
  labels: ['billing', 'lead', 'premium-customer', 'software', 'delivery'],
};

export const conversationWithAgentAndUnreadCount = {
  ...conversation,
  assignee: {
    id: 1,
    name: 'John Doe',
  },
  unreadCount: 1,
};

export const conversationWithAttachment = {
  ...conversation,
  lastMessage: {
    ...conversation.lastMessage,
    content: null,
    messageType: 1 as MessageType,
    attachments: [
      {
        id: 717,
        messageId: 59389,
        fileType: 'file',
        accountId: 51,
        extension: null,
        dataUrl: 'https://i.pravatar.cc/300',
        thumbUrl: 'https://i.pravatar.cc/300',
        fileSize: 6099463,
      },
    ],
  },
};
