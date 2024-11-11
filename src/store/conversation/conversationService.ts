import { apiService } from '@/services/APIService';
import type { ConversationAPIResponse, ConversationPayload } from './conversationTypes';

export class ConversationService {
  static async getConversations(payload: ConversationPayload): Promise<ConversationAPIResponse> {
    const { status, assigneeType, page, sortBy } = payload;
    const queryParams = `?status=${status}&assignee_type=${assigneeType}&page=${page}&sort_by=${sortBy}`;
    const response = await apiService.get<ConversationAPIResponse>(`conversations${queryParams}`);
    return response.data;
  }
}
