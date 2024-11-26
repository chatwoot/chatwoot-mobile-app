import { selectAllInboxAgents } from '../inboxAgentSelectors';
import { RootState } from '@/store';
import { agent } from './inboxAgentMockData';

describe('inboxAgentSelectors', () => {
  const state = {
    inboxAgents: {
      ids: [agent.id],
      entities: { [agent.id]: agent },
      uiFlags: { isLoading: false },
    },
  } as RootState;
  it('selects all inbox agents', () => {
    expect(selectAllInboxAgents(state)).toEqual([agent]);
  });
});
