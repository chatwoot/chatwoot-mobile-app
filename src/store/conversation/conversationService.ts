import { apiService } from '@/services/APIService';
import type {
  ConversationAPIResponse,
  ConversationPayload,
  MessagesPayload,
  MessagesAPIResponse,
  MessageBuilderPayload,
  SendMessageAPIResponse,
} from './conversationTypes';

export class ConversationService {
  static async getConversations(payload: ConversationPayload): Promise<ConversationAPIResponse> {
    const { status, assigneeType, page, sortBy, inboxId = 0 } = payload;

    const params = {
      inbox_id: inboxId || null,
      assignee_type: assigneeType,
      status: status,
      page: page,
      sort_by: sortBy,
    };
    const response = await apiService.get<ConversationAPIResponse>('conversations', {
      params,
    });
    return response.data;
  }
  static async fetchPreviousMessages(payload: MessagesPayload): Promise<MessagesAPIResponse> {
    const { conversationId, beforeId } = payload;

    const response = await apiService.get<MessagesAPIResponse>(
      `conversations/${conversationId}/messages`,
      {
        params: {
          before: beforeId,
        },
      },
    );
    return response.data;
  }

  static async sendMessage(
    conversationId: number,
    payload: MessageBuilderPayload,
  ): Promise<SendMessageAPIResponse> {
    const response = await apiService.post<SendMessageAPIResponse>(
      `conversations/${conversationId}/messages`,
      payload,
    );
    return response.data;
  }
}
