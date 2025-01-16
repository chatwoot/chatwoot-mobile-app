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
});
