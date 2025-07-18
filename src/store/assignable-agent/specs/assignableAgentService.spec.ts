import { apiService } from '@/services/APIService';
import { AssignableAgentService } from '../assignableAgentService';
import { mockInboxAgentsResponse } from './assignableAgentMockData';

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

describe('inboxAgentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches inbox agents successfully', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce(mockInboxAgentsResponse);

    const result = await AssignableAgentService.getAgents([1]);
    expect(apiService.get).toHaveBeenCalledWith('assignable_agents', {
      params: {
        'inbox_ids[]': [1],
      },
    });
    expect(result).toEqual({
      agents: mockInboxAgentsResponse.data.payload,
      inboxIds: [1],
    });
  });
});
