import { inboxAgentActions } from '../inboxAgentActions';
import { InboxAgentService } from '../inboxAgentService';
import { mockInboxAgentsResponse } from './inboxAgentMockData';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/helpers/ToastHelper', () => ({
  showToast: jest.fn(),
}));

jest.mock('../inboxAgentService', () => ({
  InboxAgentService: {
    getInboxAgents: jest.fn(),
  },
}));

describe('inboxAgentActions', () => {
  it('should fetch inbox agents successfully', async () => {
    (InboxAgentService.getInboxAgents as jest.Mock).mockResolvedValue(mockInboxAgentsResponse);

    const dispatch = jest.fn();
    const getState = jest.fn();

    const result = await inboxAgentActions.fetchInboxAgents({ inboxIds: [1] })(
      dispatch,
      getState,
      {},
    );

    expect(InboxAgentService.getInboxAgents).toHaveBeenCalled();
    expect(result.payload).toEqual(mockInboxAgentsResponse);
  });
});
