import { apiService } from '@/services/APIService';
import type {
  NotificationAPIResponse,
  MarkAsReadPayload,
  NotificationPayload,
} from './notificationTypes';

export class NotificationService {
  static async getNotifications(payload: NotificationPayload): Promise<NotificationAPIResponse> {
    const includesFilter = [payload.status, payload.type].filter(value => !!value);
    const params = {
      page: payload.page,
      sort_order: payload.sortOrder,
      includes: includesFilter,
    };
    const response = await apiService.get<NotificationAPIResponse>('notifications', {
      params,
    });
    return response.data;
  }

  static async markAllAsRead(): Promise<void> {
    await apiService.post(`notifications/read_all`);
  }

  static async markAsRead(payload: MarkAsReadPayload): Promise<void> {
    await apiService.post(`notifications/read_all`, payload);
  }
}
