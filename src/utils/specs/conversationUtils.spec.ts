import { getLastMessage } from '@/utils/conversationUtils';
import { ContentType, Conversation, MessageStatus } from '@/types';

export const conversation: Conversation = {
  id: 250,
  accountId: 1,
  additionalAttributes: {},
  agentLastSeenAt: 1,
  assigneeLastSeenAt: 1,
  canReply: true,
  contactLastSeenAt: 1,
  createdAt: 1,
  customAttributes: {},
  firstReplyCreatedAt: 1,
  inboxId: 1,
  labels: [],
  lastActivityAt: 1,
  muted: false,
  priority: 'low',
  snoozedUntil: null,
  status: 'open',
  unreadCount: 1,
  uuid: '123',
  waitingSince: 1,
  lastNonActivityMessage: null,
  meta: {
    sender: {
      id: 1,
      name: 'Test Sender',
      thumbnail: '',
      email: '',
      phoneNumber: null,
      additionalAttributes: {},
      customAttributes: {},
      createdAt: 1,
      identifier: null,
      lastActivityAt: 1,
    },
    assignee: {
      id: 1,
      name: 'Test Assignee',
      thumbnail: '',
      email: '',
      customAttributes: {},
    },
    team: null,
    hmacVerified: false,
    channel: 'Channel::Whatsapp',
  },
  timestamp: 1,
  slaPolicyId: null,
  appliedSla: null,
  messages: [
    {
      id: 438072,
      content:
        'Chatwoot enables your team to be more productive, faster, and collaborate without switching apps.',
      inboxId: 37,
      conversationId: 5811,
      messageType: 1,
      createdAt: 1620980262,
      private: false,
      status: 'sent',
      sourceId: null,
      attachments: [],
      contentAttributes: null,
      contentType: 'text',
      echoId: null,
      sender: null,
      lastNonActivityMessage: null,
      conversation: null,
      shouldRenderAvatar: false,
    },
    {
      id: 438100,
      content: 'Hey, how are you?',
      inboxId: 37,
      conversationId: 5812,
      messageType: 0,
      createdAt: 1621145476,
      private: false,
      status: 'sent',
      sourceId: null,
      attachments: [],
      contentAttributes: null,
      contentType: 'text',
      echoId: null,
      sender: null,
      lastNonActivityMessage: null,
      conversation: null,
      shouldRenderAvatar: false,
    },
  ],
};

const lastMessage = {
  id: 438100,
  content: 'Hey, how are you?',
  inboxId: 37,
  conversationId: 5812,
  messageType: 0,
  createdAt: 1621145476,
  private: false,
  status: 'sent' as MessageStatus,
  sourceId: null,
  attachments: [],
  contentAttributes: null,
  contentType: 'text' as ContentType,
  echoId: null,
  sender: null,
  lastNonActivityMessage: null,
  conversation: null,
  shouldRenderAvatar: false,
};

describe('getLastMessage', () => {
  it("should return last activity message if both api and store doesn't have other messages", () => {
    expect(getLastMessage(conversation)).toEqual(lastMessage);
  });
  it('should return message from store if store has latest message', () => {
    const testConversation = {
      ...conversation,
      messages: [],
      lastNonActivityMessage: lastMessage,
    };
    expect(getLastMessage(testConversation)).toEqual(lastMessage);
  });

  it('should return last non activity message from store if api value is empty', () => {
    const testConversation = {
      ...conversation,
      messages: [lastMessage],
    };
    expect(getLastMessage(testConversation)).toEqual(lastMessage);
  });

  it("should return last non activity message from store if store doesn't have any messages", () => {
    const testConversation = {
      ...conversation,
      messages: [lastMessage],
    };
    expect(getLastMessage(testConversation)).toEqual(lastMessage);
  });
});
