import { apiService } from '@/services/APIService';
import type { InboxAgentAPIResponse } from './inboxAgentTypes';

export class InboxAgentService {
  static async getInboxAgents(inboxIds: string[]): Promise<InboxAgentAPIResponse> {
    const response = await apiService.get<InboxAgentAPIResponse>('assignable_agents', {
      params: {
        inbox_ids: inboxIds,
      },
    });
    return response.data;
  }
}
