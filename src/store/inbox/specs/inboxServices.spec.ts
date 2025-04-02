import { transformInbox } from '@/utils/camelCaseKeys';
import { InboxService } from '../inboxService';
import { mockInboxesResponse } from './inboxMockData';
import { apiService } from '@/services/APIService';

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

describe('InboxService', () => {
  it('should get inboxes and transform the data', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce(mockInboxesResponse);

    const result = await InboxService.index();
    expect(apiService.get).toHaveBeenCalledWith('inboxes');
    expect(result).toEqual({
      payload: mockInboxesResponse.data.payload.map(transformInbox),
    });
  });
});
