import { InboxService } from '../inboxService';
import { mockInboxesResponse } from './inboxMockData';
import { apiService } from '@/services/APIService';

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

describe('InboxService', () => {
  it('should get inboxes', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce(mockInboxesResponse);

    const result = await InboxService.getInboxes();
    expect(apiService.get).toHaveBeenCalledWith('inboxes');
    expect(result).toEqual(mockInboxesResponse.data);
  });
});
