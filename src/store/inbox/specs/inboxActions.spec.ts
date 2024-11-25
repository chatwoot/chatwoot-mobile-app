import { inboxActions } from '../inboxActions';
import { mockInboxesResponse } from './inboxMockData';
import { InboxService } from '../inboxService';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/helpers/ToastHelper', () => ({
  showToast: jest.fn(),
}));

jest.mock('../inboxService', () => ({
  InboxService: {
    getInboxes: jest.fn(),
  },
}));

describe('inboxActions', () => {
  describe('fetchInboxes', () => {
    const { fetchInboxes } = inboxActions;

    it('should fetch inboxes successfully', async () => {
      // Update mockResponse to match the expected structure
      const mockResponse = mockInboxesResponse; // Remove the extra payload wrapper
      (InboxService.getInboxes as jest.Mock).mockResolvedValue(mockResponse.data);

      const dispatch = jest.fn();
      const getState = jest.fn();

      const result = await fetchInboxes()(dispatch, getState, {});

      expect(InboxService.getInboxes).toHaveBeenCalled();
      expect(result.payload).toEqual({
        payload: mockInboxesResponse.data.payload.map(inbox => ({
          ...inbox,
        })),
      });
    });
  });
});
