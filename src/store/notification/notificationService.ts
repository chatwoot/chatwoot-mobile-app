import { apiService } from '@/services/APIService';
import type { NotificationResponse } from './notificationTypes';

export class NotificationService {
  static async getNotifications(page: number = 1): Promise<NotificationResponse> {
    const response = await apiService.get<NotificationResponse>(`notifications?page=${page}`);
    return response.data;
  }

  static async markAsRead(accountId: number, notificationId: number): Promise<void> {
    await apiService.post(`api/v1/accounts/${accountId}/notifications/${notificationId}/read`);
  }

  static async markAllAsRead(accountId: number): Promise<void> {
    await apiService.post(`api/v1/accounts/${accountId}/notifications/read_all`);
  }
}
