import type { RootState } from '@/store';
import { inboxAgentAdapter } from './inboxAgentSlice';

export const selectInboxAgentsState = (state: RootState) => state.inboxAgents;

export const { selectAll: selectAllInboxAgents } =
  inboxAgentAdapter.getSelectors<RootState>(selectInboxAgentsState);
