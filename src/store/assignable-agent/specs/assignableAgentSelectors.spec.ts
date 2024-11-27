import { selectAllAssignableAgents } from '../assignableAgentSelectors';
import { RootState } from '@/store';
import { agent } from './assignableAgentMockData';

describe('inboxAgentSelectors', () => {
  const state = {
    assignableAgents: {
      ids: [agent.id],
      entities: { [agent.id]: agent },
      uiFlags: { isLoading: false },
    },
  } as RootState;
  it('selects all inbox agents', () => {
    expect(selectAllAssignableAgents(state)).toEqual([agent]);
  });
});
