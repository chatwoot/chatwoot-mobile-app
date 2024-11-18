import { apiService } from '@/services/APIService';
import type {
  ConversationPayload,
  MessagesPayload,
  MessagesAPIResponse,
  MessageBuilderPayload,
  SendMessageAPIResponse,
  ConversationListAPIResponse,
  ConversationAPIResponse,
  ToggleConversationStatusPayload,
  ToggleConversationStatusAPIResponse,
  BulkActionPayload,
  AssigneePayload,
  AssigneeAPIResponse,
  MarkMessagesUnreadPayload,
  MarkMessagesUnreadAPIResponse,
  MarkMessageReadPayload,
  MarkMessageReadAPIResponse,
  MuteOrUnmuteConversationPayload,
  ConversationLabelPayload,
} from './conversationTypes';

export class ConversationService {
  static async getConversations(
    payload: ConversationPayload,
  ): Promise<ConversationListAPIResponse> {
    const { status, assigneeType, page, sortBy, inboxId = 0 } = payload;

    const params = {
      inbox_id: inboxId || null,
      assignee_type: assigneeType,
      status: status,
      page: page,
      sort_by: sortBy,
    };
    const response = await apiService.get<ConversationListAPIResponse>('conversations', {
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

  static async fetchConversation(conversationId: number): Promise<ConversationAPIResponse> {
    const response = await apiService.get<ConversationAPIResponse>(
      `conversations/${conversationId}`,
    );
    return response.data;
  }

  static async toggleConversationStatus({
    conversationId,
    payload,
  }: ToggleConversationStatusPayload): Promise<ToggleConversationStatusAPIResponse> {
    const response = await apiService.post<ToggleConversationStatusAPIResponse>(
      `conversations/${conversationId}/toggle_status`,
      payload,
    );
    return response.data;
  }
  static async bulkAction(payload: BulkActionPayload): Promise<void> {
    await apiService.post('bulk_actions', payload);
  }
  static async assignConversation(payload: AssigneePayload): Promise<AssigneeAPIResponse> {
    const { conversationId, assigneeId } = payload;
    const response = await apiService.post<AssigneeAPIResponse>(
      `conversations/${conversationId}/assignments?assignee_id=${assigneeId}`,
    );
    return response.data;
  }

  static async markMessagesUnread(
    payload: MarkMessagesUnreadPayload,
  ): Promise<MarkMessagesUnreadAPIResponse> {
    const { conversationId } = payload;
    const response = await apiService.post<MarkMessagesUnreadAPIResponse>(
      `conversations/${conversationId}/unread`,
    );
    return response.data;
  }

  static async markMessageRead(
    payload: MarkMessageReadPayload,
  ): Promise<MarkMessageReadAPIResponse> {
    const { conversationId } = payload;
    const response = await apiService.post<MarkMessageReadAPIResponse>(
      `conversations/${conversationId}/update_last_seen`,
    );
    return response.data;
  }

  static async muteConversation(payload: MuteOrUnmuteConversationPayload): Promise<void> {
    const { conversationId } = payload;
    await apiService.post(`conversations/${conversationId}/mute`);
  }

  static async unmuteConversation(payload: MuteOrUnmuteConversationPayload): Promise<void> {
    const { conversationId } = payload;
    await apiService.post(`conversations/${conversationId}/unmute`);
  }

  static async addOrUpdateConversationLabels(payload: ConversationLabelPayload): Promise<void> {
    const { conversationId, labels } = payload;
    await apiService.post(`conversations/${conversationId}/labels`, { labels });
  }
}
