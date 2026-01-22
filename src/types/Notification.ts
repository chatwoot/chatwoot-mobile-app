import { ConversationPriority } from './common';
import type { User } from './User';
import type { ConversationAdditionalAttributes } from './Conversation';
export type NotificationType =
  | 'sla_missed_next_response'
  | 'sla_missed_first_response'
  | 'sla_missed_resolution'
  | 'conversation_creation'
  | 'conversation_assignment'
  | 'assigned_conversation_new_message'
  | 'conversation_mention'
  | 'participating_conversation_new_message';

export type PrimaryActorType = 'Conversation' | 'Message';

export type Notification = {
  id: number;
  notificationType: NotificationType;
  pushMessageTitle: string;
  primaryActorType: PrimaryActorType;
  primaryActorId: number;
  primaryActor: PrimaryActor;
  readAt: string;
  user: User;
  snoozedUntil: string;
  createdAt: number;
  lastActivityAt: number;
  meta: object;
  secondaryActor?: SecondaryActor;
};

export type SecondaryActor = {
  id: number;
  conversationId: number;
  senderType: 'User' | 'Contact';
  senderId: number;
  sender: {
    id: number;
    name: string;
    type: 'contact' | 'user' | string;
    email: string | null;
    phoneNumber: string;
    thumbnail: string;
    identifier: string;
  };
};



export type PrimaryActor = {
  id: number;
  priority?: ConversationPriority | null;
  meta: {
    assignee: User;
    sender: User;
  };
  inboxId: number;
  additionalAttributes: ConversationAdditionalAttributes;
  conversationId: number;
};

export interface NotificationMeta {
  unreadCount: number;
  count: number;
  currentPage: string;
}
