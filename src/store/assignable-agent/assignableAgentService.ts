import { apiService } from '@/services/APIService';
import type { AssignableAgentAPIResponse } from './assignableAgentTypes';
import { transformInboxAgent } from '@/utils/camelCaseKeys';

export class AssignableAgentService {
  static async getAgents(inboxIds: number[]): Promise<AssignableAgentAPIResponse> {
    const response = await apiService.get<AssignableAgentAPIResponse>('assignable_agents', {
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
