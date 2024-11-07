import { apiService } from '@/services/APIService';
import type { NotificationResponse, MarkAsReadPayload } from './notificationTypes';

export class NotificationService {
  static async getNotifications(page: number = 1): Promise<NotificationResponse> {
    const response = await apiService.get<NotificationResponse>(`notifications?page=${page}`);
    return response.data;
  }

  static async markAllAsRead(): Promise<void> {
    await apiService.post(`notifications/read_all`);
  }

  static async markAsRead(payload: MarkAsReadPayload): Promise<void> {
    await apiService.post(`notifications/read_all`, payload);
  }
}
