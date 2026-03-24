import { apiService } from '@/services/APIService';
import type {
  CopilotRewritePayload,
  CopilotSummarizePayload,
  CopilotReplySuggestionPayload,
  CopilotFollowUpPayload,
  CopilotTaskResponse,
} from '@/types/Copilot';

export class CopilotService {
  static async rewrite(
    payload: CopilotRewritePayload,
    signal?: AbortSignal,
  ): Promise<CopilotTaskResponse> {
    const response = await apiService.post<CopilotTaskResponse>(
      'captain/tasks/rewrite',
      {
        content: payload.content,
        operation: payload.operation,
        conversation_display_id: payload.conversationId,
      },
      { signal },
    );
    return response.data;
  }

  static async summarize(
    payload: CopilotSummarizePayload,
    signal?: AbortSignal,
  ): Promise<CopilotTaskResponse> {
    const response = await apiService.post<CopilotTaskResponse>(
      'captain/tasks/summarize',
      { conversation_display_id: payload.conversationId },
      { signal },
    );
    return response.data;
  }

  static async replySuggestion(
    payload: CopilotReplySuggestionPayload,
    signal?: AbortSignal,
  ): Promise<CopilotTaskResponse> {
    const response = await apiService.post<CopilotTaskResponse>(
      'captain/tasks/reply_suggestion',
      { conversation_display_id: payload.conversationId },
      { signal },
    );
    return response.data;
  }

  static async followUp(
    payload: CopilotFollowUpPayload,
    signal?: AbortSignal,
  ): Promise<CopilotTaskResponse> {
    const response = await apiService.post<CopilotTaskResponse>(
      'captain/tasks/follow_up',
      {
        follow_up_context: payload.followUpContext,
        message: payload.message,
      },
      { signal },
    );
    return response.data;
  }
}
