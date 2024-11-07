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
  notification_type: NotificationType;
  push_message_title: string;
  primary_actor_type: PrimaryActorType;
  primary_actor_id: number;
  primary_actor: PrimaryActor;
  read_at: string;
  user: User;
  snoozed_until: string;
  created_at: number;
  last_activity_at: number;
  meta: object;
};

export type PrimaryActor = {
  meta: {
    assignee: User;
  };
};
