import type { Notification, PrimaryActorType } from '@/types/Notification';

export interface NotificationAPIResponse {
  data: {
    meta: {
      unreadCount: number;
      count: number;
      currentPage: string;
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
  payload: Notification[];
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
  primaryActorId: number;
  primaryActorType: PrimaryActorType;
}

export type InboxSortTypes = 'asc' | 'desc';

export const InboxSortOptions: Record<InboxSortTypes, string> = {
  desc: 'desc',
  asc: 'asc',
};
