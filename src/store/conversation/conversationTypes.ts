import type { Conversation } from '@/types/Conversation';
import type {
  AssigneeTypes,
  ConversationStatus,
  SortTypes,
} from '@/types/common/ConversationStatus';

export interface ConversationResponse {
  data: {
    meta: {
      unread_count: number;
      count: number;
      current_page: string;
    };
    payload: Conversation[];
  };
}

export interface ConversationPayload {
  page: number;
  status: ConversationStatus;
  assigneeType: AssigneeTypes;
  sortBy: SortTypes;
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
}
