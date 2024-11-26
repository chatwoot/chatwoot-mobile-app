import { apiService } from '@/services/APIService';
import type { InboxAgentAPIResponse } from './inboxAgentTypes';
import { transformInboxAgent } from '@/utils/camelCaseKeys';

export class InboxAgentService {
  static async getInboxAgents(inboxIds: number[]): Promise<InboxAgentAPIResponse> {
    const response = await apiService.get<InboxAgentAPIResponse>('assignable_agents', {
      params: {
        'inbox_ids[]': inboxIds,
      },
    });
    const inboxesAgents = response.data.payload.map(transformInboxAgent);
    return {
      payload: inboxesAgents,
    };
  }
}
