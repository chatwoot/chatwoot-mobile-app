import type { User } from './User';

type NotificationType =
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
};

export type PrimaryActor = {
  meta: {
    assignee: User;
    sender: User;
  };
};

export interface NotificationMeta {
  unreadCount: number;
  count: number;
  currentPage: string;
}