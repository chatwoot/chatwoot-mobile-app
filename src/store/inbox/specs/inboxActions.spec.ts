import { inboxActions } from '../inboxActions';
import { mockInboxesResponse } from './inboxMockData';
import { InboxService } from '../inboxService';
import { transformInbox } from '@/utils/camelCaseKeys';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('../inboxService', () => ({
  InboxService: {
    index: jest.fn(),
  },
}));

describe('inboxActions', () => {
  describe('fetchInboxes', () => {
    const { fetchInboxes } = inboxActions;

    it('should fetch inboxes successfully', async () => {
      const transformedResponse = {
        payload: mockInboxesResponse.data.payload.map(transformInbox),
      };
      (InboxService.index as jest.Mock).mockResolvedValue(transformedResponse);

      const dispatch = jest.fn();
      const getState = jest.fn();

      const result = await fetchInboxes()(dispatch, getState, {});

      expect(InboxService.index).toHaveBeenCalled();
      expect(result.payload).toEqual(transformedResponse);
    });
  });
});
