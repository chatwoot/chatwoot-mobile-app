import type { Agent } from '@/types';

export interface ConversationParticipantAPIResponse {
  data: Agent[];
}

export interface ConversationParticipantPayload {
  conversationId: number;
}

export interface ConversationParticipantResponse {
  participants: Agent[];
  conversationId: number;
}

export interface UpdateConversationParticipantPayload {
  conversationId: number;
  userIds: number[];
}
