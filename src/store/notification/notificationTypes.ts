import type { Notification } from '@/types/Notification';

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
