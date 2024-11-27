import { Agent } from '@/types';

export const agent: Agent = {
  id: 1,
  name: 'Test Agent',
};

export const mockInboxAgentsResponse = { data: { payload: [agent] } };
