import { Agent } from '@/types';

export interface AssignableAgentAPIResponse {
  payload: Agent[];
}

export interface AssignableAgentPayload {
  inboxIds: number[];
}
