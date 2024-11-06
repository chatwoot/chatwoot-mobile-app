import { apiService } from '@/services/APIService';
import type { NotificationResponse } from './notificationTypes';

export class NotificationService {
  static async getNotifications(page: number = 1): Promise<NotificationResponse> {
    const response = await apiService.get<NotificationResponse>(`notifications?page=${page}`);
    return response.data;
  }
}
