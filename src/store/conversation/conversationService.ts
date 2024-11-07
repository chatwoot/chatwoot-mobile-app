import { apiService } from '@/services/APIService';
import type { ConversationResponse, ConversationPayload } from './conversationTypes';

export class ConversationService {
  static async getConversations(payload: ConversationPayload): Promise<ConversationResponse> {
    const { status, assigneeType, page, sortBy } = payload;
    const queryParams = `?status=${status}&assignee_type=${assigneeType}&page=${page}&sort_by=${sortBy}`;
    const response = await apiService.get<ConversationResponse>(`conversations${queryParams}`);
    return response.data;
  }
}
