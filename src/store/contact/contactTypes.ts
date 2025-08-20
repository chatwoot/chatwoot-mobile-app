import { Conversation } from '@/types';
export interface ContactLabelsAPIResponse {
  payload: string[];
}

export interface ContactLabelsPayload {
  contactId: number;
}

export interface UpdateContactLabelsPayload {
  contactId: number;
  labels: string[];
}

export interface ContactConversationPayload {
  contactId: number;
}

export interface ContactConversationAPIResponse {
  payload: Conversation[];
}

export interface ToggleAIPayload {
  contactId: number;
  aiEnabled: boolean;
}

export interface ToggleAIResponse {
  ai_enabled: boolean;
}
