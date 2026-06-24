import { ConversationService } from '../conversationService';
import { apiService } from '@/services/APIService';
import { conversation, conversationListResponse } from './conversationMockData';
import { transformConversation, transformConversationListMeta } from '@/utils/camelCaseKeys';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ConversationService', () => {
  it('should fetch all conversations', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce({
      data: conversationListResponse,
    });

    const result = await ConversationService.getConversations({
      status: 'open',
      assigneeType: 'all',
      page: 1,
      sortBy: 'latest',
    });
    expect(apiService.get).toHaveBeenCalledWith('conversations', {
      params: {
        inbox_id: null,
        assignee_type: 'all',
        status: 'open',
        page: 1,
        sort_by: 'latest',
      },
    });
    expect(result).toEqual({
      conversations: conversationListResponse.data.payload.map(transformConversation),
      meta: transformConversationListMeta(conversationListResponse.data.meta),
    });
  });

  it('should fetch conversation', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce({
      data: conversation,
    });

    const result = await ConversationService.fetchConversation(1);
    expect(result).toEqual({
      conversation: transformConversation(conversation),
    });

    expect(apiService.get).toHaveBeenCalledWith('conversations/1');
  });

  it('should create a conversation for a contactable inbox', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      data: conversation,
    });

    const result = await ConversationService.createConversation({
      contactId: 1,
      inboxId: 10,
      sourceId: '+12025550198',
      assigneeId: 7,
    });

    expect(apiService.post).toHaveBeenCalledWith('conversations', {
      contact_id: 1,
      inbox_id: 10,
      source_id: '+12025550198',
      assignee_id: 7,
    });
    expect(result).toEqual({
      conversation: transformConversation(conversation),
    });
  });

  it('should toggle conversation status', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      data: {
        payload: {
          conversation_id: 1,
          current_status: 'resolved',
          snoozed_until: null,
        },
      },
    });

    const result = await ConversationService.toggleConversationStatus({
      conversationId: 1,
      payload: { status: 'resolved', snoozed_until: null },
    });
    expect(apiService.post).toHaveBeenCalledWith('conversations/1/toggle_status', {
      status: 'resolved',
      snoozed_until: null,
    });

    expect(result).toEqual({
      conversationId: 1,
      currentStatus: 'resolved',
      snoozedUntil: null,
    });
  });

  it('should mute conversation', async () => {
    await ConversationService.muteConversation({ conversationId: 1 });

    expect(apiService.post).toHaveBeenCalledWith('conversations/1/mute');
  });

  it('should mark a conversation unread', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      data: {
        id: 250,
        unread_count: 1,
        agent_last_seen_at: 42,
      },
    });

    const result = await ConversationService.markMessagesUnread({ conversationId: 250 });

    expect(apiService.post).toHaveBeenCalledWith('conversations/250/unread');
    expect(result).toEqual({
      conversationId: 250,
      unreadCount: 1,
      agentLastSeenAt: 42,
    });
  });

  it('normalizes payload wrapped unread state responses', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      data: {
        payload: {
          id: 250,
          unread_count: 1,
          agent_last_seen_at: 42,
        },
      },
    });

    const result = await ConversationService.markMessagesUnread({ conversationId: 250 });

    expect(apiService.post).toHaveBeenCalledWith('conversations/250/unread');
    expect(result).toEqual({
      conversationId: 250,
      unreadCount: 1,
      agentLastSeenAt: 42,
    });
  });

  it('should mark a conversation read', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      data: {
        id: 250,
        unread_count: 0,
        agent_last_seen_at: 43,
      },
    });

    const result = await ConversationService.markMessageRead({ conversationId: 250 });

    expect(apiService.post).toHaveBeenCalledWith('conversations/250/update_last_seen');
    expect(result).toEqual({
      conversationId: 250,
      unreadCount: 0,
      agentLastSeenAt: 43,
    });
  });

  it('refreshes the conversation read state when the read endpoint returns no body', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      data: undefined,
    });
    (apiService.get as jest.Mock).mockResolvedValueOnce({
      data: {
        ...conversation,
        unreadCount: 2,
        agentLastSeenAt: 44,
      },
    });

    const result = await ConversationService.markMessagesUnread({ conversationId: 250 });

    expect(apiService.post).toHaveBeenCalledWith('conversations/250/unread');
    expect(apiService.get).toHaveBeenCalledWith('conversations/250');
    expect(result).toEqual({
      conversationId: 250,
      unreadCount: 2,
      agentLastSeenAt: 44,
    });
  });

  it('refreshes the conversation read state when the read endpoint omits unread fields', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      data: {},
    });
    (apiService.get as jest.Mock).mockResolvedValueOnce({
      data: {
        ...conversation,
        unreadCount: 3,
        agentLastSeenAt: 45,
      },
    });

    const result = await ConversationService.markMessagesUnread({ conversationId: 250 });

    expect(apiService.post).toHaveBeenCalledWith('conversations/250/unread');
    expect(apiService.get).toHaveBeenCalledWith('conversations/250');
    expect(result).toEqual({
      conversationId: 250,
      unreadCount: 3,
      agentLastSeenAt: 45,
    });
  });
});
