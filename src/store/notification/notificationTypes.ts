import type { Notification, PrimaryActorType } from '@/types/Notification';

export interface NotificationAPIResponse {
  data: {
    meta: {
      unread_count: number;
      count: number;
      current_page: string;
    };
    payload: Notification[];
  };
}

export interface NotificationResponse {
  meta: {
    unreadCount: number;
    count: number;
    currentPage: string;
  };
  notifications: Notification[];
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
