import { apiService } from '@/services/APIService';
import type {
  ConversationParticipantPayload,
  ConversationParticipantResponse,
} from './conversationParticipantTypes';
import { transformAgent } from '@/utils/camelCaseKeys';
import { Agent } from '@/types';

export class ConversationParticipantService {
  static async index(
    payload: ConversationParticipantPayload,
  ): Promise<ConversationParticipantResponse> {
    const { conversationId } = payload;
    const response = await apiService.get<Agent[]>(`conversations/${conversationId}/participants`);
    const transformedResponse = response.data.map(transformAgent);
    return {
      participants: transformedResponse,
      conversationId,
    };
  }
}
