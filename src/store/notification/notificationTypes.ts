import type { Notification, PrimaryActorType } from '@/types/Notification';

export interface NotificationResponse {
  data: {
    meta: {
      unread_count: number;
      count: number;
      current_page: string;
    };
    payload: Notification[];
  };
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
}

export interface NotificationCreatedResponse {
  account_id: number;
  unread_count: number;
  count: number;
  notification: Notification;
}

export interface NotificationRemovedResponse {
  account_id: number;
  unread_count: number;
  count: number;
  notification: Notification;
}

export interface MarkAsReadPayload {
  primary_actor_id: number;
  primary_actor_type: PrimaryActorType;
}
