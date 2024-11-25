import { inboxActions } from '../inboxActions';
import { mockInboxesResponse } from './inboxMockData';
import { InboxService } from '../inboxService';
import { transformInbox } from '@/utils/camelCaseKeys';

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
      const transformedResponse = {
        payload: mockInboxesResponse.data.payload.map(transformInbox),
      };
      (InboxService.getInboxes as jest.Mock).mockResolvedValue(transformedResponse);

      const dispatch = jest.fn();
      const getState = jest.fn();

      const result = await fetchInboxes()(dispatch, getState, {});

      expect(InboxService.getInboxes).toHaveBeenCalled();
      expect(result.payload).toEqual(transformedResponse);
    });
  });
});
