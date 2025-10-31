import { Channel, ContentType, MessageStatus, MessageType, ConversationPriority } from '@/types';

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
    provider: 'facebook',
  },
  priority: 'medium',
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
    senderId: 1,
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
    messageType: 1 as MessageType,
  },
};

export const conversationWithOutgoingMessage = {
  ...conversation,
  lastMessage: {
    ...conversation.lastMessage,
    messageType: 1 as MessageType,
  },
};

export const conversationWithSLA = {
  ...conversation,
  slaPolicyId: 8,
  appliedSla: {
    id: 3983,
    slaId: 8,
    slaStatus: 'active_with_misses',
    createdAt: 1731632416,
    updatedAt: 1731647115,
    slaDescription: 'SLA Applied for conversations by paid users',
    slaName: 'In App // Paid SLA',
    slaFirstResponseTimeThreshold: 14400,
    slaNextResponseTimeThreshold: 14400,
    slaOnlyDuringBusinessHours: false,
    slaResolutionTimeThreshold: 604800,
  },
  appliedSlaConversationDetails: {
    firstReplyCreatedAt: 1731661661,
    waitingSince: 1732604153,
    status: 'open',
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
    private: true,
    attachments: [
      {
        id: 717,
        messageId: 59389,
        fileType: 'image',
        accountId: 51,
        extension: null,
        dataUrl: 'https://i.pravatar.cc/300',
        thumbUrl: 'https://i.pravatar.cc/300',
        fileSize: 6099463,
      },
    ],
  },
};

export const conversationWithNonEnglishContact = {
  ...conversation,
  senderName: '马健航',
  lastMessage: {
    ...conversation.lastMessage,
    messageType: 1 as MessageType,
  },
};

export const conversationWithMoreLabels = {
  ...conversationWithLabelAndSLA,
  labels: ['billing', 'lead', 'premium-customer', 'software', 'delivery', 'test'],
};

export const conversationWithMarkdownMessage = {
  ...conversation,
  lastMessage: {
    ...conversation.lastMessage,
    content:
      '[@John Doe](mention://user/1/John%20Doe), Please try [Github.com](https://github.com) for the detailed <b>Guide</b>',
    messageType: 0 as MessageType,
  },
};

export const conversationWithNewLineMessage = {
  ...conversation,
  lastMessage: {
    ...conversation.lastMessage,
    content: `Hey Dominique,\n\n Generally, the review process takes around 3-4 weeks`,
    messageType: 1 as MessageType,
  },
};

export const conversationWithAllFields = {
  ...conversationWithMoreLabels,
  isSelected: false,
  unreadCount: 2,
  priority: 'high' as ConversationPriority,
  availabilityStatus: 'offline',
};
