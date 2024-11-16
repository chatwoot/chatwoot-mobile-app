import { Agent } from '@/types';

export interface InboxAgentAPIResponse {
  payload: Agent[];
}

export interface InboxAgentPayload {
  inboxIds: number[];
}
