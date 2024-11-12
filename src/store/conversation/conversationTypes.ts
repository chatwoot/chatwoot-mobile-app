import type { Conversation, ConversationMeta } from '@/types/Conversation';
import type {
  AssigneeTypes,
  ConversationStatus,
  SortTypes,
} from '@/types/common/ConversationStatus';

export interface ConversationAPIResponse {
  data: {
    meta: ConversationMeta;
    payload: Conversation[];
  };
}

export interface ConversationResponse {
  meta: ConversationMeta;
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
