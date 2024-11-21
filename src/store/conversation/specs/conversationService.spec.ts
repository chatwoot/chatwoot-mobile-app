import { ConversationService } from '../conversationService';
import { apiService } from '@/services/APIService';
import { conversationListResponse } from './conversationMockData';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/helpers/ToastHelper', () => ({
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
    (apiService.get as jest.Mock).mockResolvedValueOnce(conversationListResponse);

    const result = await ConversationService.getConversations({
      status: 'open',
      assigneeType: 'all',
      page: 1,
      sortBy: 'latest',
    });

    expect(result).toEqual(conversationListResponse.data);
  });

  it('should fetch conversation', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce(conversationListResponse);

    const result = await ConversationService.fetchConversation(1);

    expect(result).toEqual(conversationListResponse.data);

    expect(apiService.get).toHaveBeenCalledWith('conversations/1');
  });

  it('should toggle conversation status', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      data: {
        conversation_id: 1,
        current_status: 'resolved',
        snoozed_until: null,
        success: true,
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
      conversation_id: 1,
      current_status: 'resolved',
      snoozed_until: null,
      success: true,
    });
  });

  it('should mute conversation', async () => {
    await ConversationService.muteConversation({ conversationId: 1 });

    expect(apiService.post).toHaveBeenCalledWith('conversations/1/mute');
  });
});
