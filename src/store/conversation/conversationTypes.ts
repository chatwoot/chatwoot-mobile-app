import type { Conversation, ConversationListMeta, ConversationMeta } from '@/types/Conversation';
import type {
  AssigneeTypes,
  ConversationStatus,
  SortTypes,
} from '@/types/common/ConversationStatus';
import type { Message } from '@/types/Message';
import { MESSAGE_STATUS, MESSAGE_TYPES } from '@/constants';
import { Agent, Team } from '@/types';

export interface ConversationListAPIResponse {
  data: {
    meta: ConversationListMeta;
    payload: Conversation[];
  };
}

export interface ConversationAPIResponse {
  data: Conversation;
}

export interface ConversationListResponse {
  meta: ConversationListMeta;
  conversations: Conversation[];
}

export interface ConversationResponse {
  conversation: Conversation;
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

export interface SendMessagePayload {
  conversationId: number;
  message: string;
  private: boolean;
  sender: {
    id: number;
    thumbnail?: string;
  };
  file?: File;
  contentAttributes?: {
    inReplyTo: number;
  };
  templateParams?: string;
  ccEmails?: string;
  bccEmails?: string;
  toEmails?: string;
}

export interface PendingMessage extends SendMessagePayload {
  content: string | null;
  id: string;
  echoId: string;
  status: typeof MESSAGE_STATUS.PROGRESS;
  createdAt: number;
  messageType: typeof MESSAGE_TYPES.OUTGOING;
  attachments: { id: string }[] | null;
}

export type MessageBuilderPayload =
  | FormData
  | {
      content: string;
      private: boolean;
      echo_id: string;
      content_attributes?: Record<string, unknown>;
      cc_emails?: string;
      bcc_emails?: string;
      template_params?: string;
    };

export interface SendMessageAPIResponse {
  id: number;
  content: string;
  inbox_id: number;
  echo_id: string;
  conversation_id: number;
  message_type: typeof MESSAGE_TYPES;
  content_type: string;
  status: typeof MESSAGE_STATUS;
  content_attributes?: Record<string, unknown>;
  created_at: number;
  private: boolean;
  source_id: string | null;
  sender: {
    id: number;
    name: string;
    available_name: string;
    avatar_url: string;
    type: string;
    availability_status: string;
    thumbnail: string;
  };
}

export interface ToggleConversationStatusPayload {
  conversationId: number;
  payload: {
    status: ConversationStatus;
    snoozed_until: number | null;
  };
}

export interface ToggleConversationStatusAPIResponse {
  payload: {
    conversation_id: number;
    current_status: ConversationStatus;
    snoozed_until: number | null;
    success: boolean;
  };
}

export interface BulkActionPayload {
  type: string;
  ids: number[];
  fields?: BulkActionFields;
  labels?: BulkActionLabels;
}

export interface BulkActionFields {
  status?: ConversationStatus;
  assignee_id?: number;
  team_id?: number;
}

export interface BulkActionLabels {
  add: string[];
}

export interface AssigneePayload {
  conversationId: number;
  assigneeId: number;
}

export interface AssignTeamPayload {
  conversationId: number;
  teamId: string;
}

export interface AssignTeamAPIResponse {
  data: {
    payload: Team;
  };
}

export interface AssigneeAPIResponse {
  data: {
    payload: Agent;
  };
}

export interface MarkMessagesUnreadPayload {
  conversationId: number;
}

export interface MuteOrUnmuteConversationPayload {
  conversationId: number;
}

export interface MarkMessageReadPayload {
  conversationId: number;
}

export interface MarkMessagesUnreadAPIResponse {
  id: number;
  unread_count: number;
  agent_last_seen_at: number;
}

export interface MarkMessageReadAPIResponse {
  id: number;
  agent_last_seen_at: number;
  unread_count: number;
}

export interface MarkMessageReadOrUnreadResponse {
  conversationId: number;
  agentLastSeenAt: number;
  unreadCount: number;
}

export interface ConversationLabelPayload {
  conversationId: number;
  labels: string[];
}

export interface DeleteMessagePayload {
  conversationId: number;
  messageId: number;
}

export interface DeleteMessageAPIResponse {
  data: Message;
}
