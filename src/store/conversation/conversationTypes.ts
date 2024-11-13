import type { Conversation, ConversationListMeta, ConversationMeta } from '@/types/Conversation';
import type {
  AssigneeTypes,
  ConversationStatus,
  SortTypes,
} from '@/types/common/ConversationStatus';
import type { Message } from '@/types/Message';
export interface ConversationAPIResponse {
  data: {
    meta: ConversationListMeta;
    payload: Conversation[];
  };
}

export interface ConversationResponse {
  meta: ConversationListMeta;
  conversations: Conversation[];
}

export interface ConversationPayload {
  page: number;
  status: ConversationStatus;
  assigneeType: AssigneeTypes;
  sortBy: SortTypes;
  inboxId?: number;
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
}

export interface MessagesAPIResponse {
  meta: ConversationMeta;
  payload: Message[];
}

export interface MessagesPayload {
  conversationId: number;
  beforeId?: number | null;
}

export interface MessagesResponse {
  meta: ConversationMeta;
  messages: Message[];
  conversationId: number;
}
