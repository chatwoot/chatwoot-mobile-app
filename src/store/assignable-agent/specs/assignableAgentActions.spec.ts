import { assignableAgentActions } from '../assignableAgentActions';
import { AssignableAgentService } from '../assignableAgentService';
import { mockInboxAgentsResponse } from './assignableAgentMockData';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('../assignableAgentService', () => ({
  AssignableAgentService: {
    getAgents: jest.fn(),
  },
}));

describe('inboxAgentActions', () => {
  it('should fetch inbox agents successfully', async () => {
    (AssignableAgentService.getAgents as jest.Mock).mockResolvedValue(mockInboxAgentsResponse);

    const dispatch = jest.fn();
    const getState = jest.fn();

    const result = await assignableAgentActions.fetchAgents({ inboxIds: [1] })(
      dispatch,
      getState,
      {},
    );

    expect(AssignableAgentService.getAgents).toHaveBeenCalled();
    expect(result.payload).toEqual(mockInboxAgentsResponse);
  });
});
