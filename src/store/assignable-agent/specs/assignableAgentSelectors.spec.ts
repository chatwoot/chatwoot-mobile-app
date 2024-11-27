import { selectAssignableAgentsByInboxId } from '../assignableAgentSelectors';
import { RootState } from '@/store';
import { agent } from './assignableAgentMockData';

describe('inboxAgentSelectors', () => {
  const state = {
    assignableAgents: {
      records: {
        1: [agent],
        '2,3': [agent],
      },
      uiFlags: { isLoading: false },
    },
  } as Partial<RootState> as RootState;

  it('selects all inbox agents for single inbox', () => {
    expect(selectAssignableAgentsByInboxId(state, [1], '')).toEqual([
      {
        confirmed: true,
        name: 'None',
        id: 0,
        role: 'agent',
        accountId: 0,
      },
      agent,
    ]);
  });

  it('selects all inbox agents for multiple inboxes', () => {
    expect(selectAssignableAgentsByInboxId(state, [2, 3], '')).toEqual([
      {
        confirmed: true,
        name: 'None',
        id: 0,
        role: 'agent',
        accountId: 0,
      },
    ]);
  });
});
