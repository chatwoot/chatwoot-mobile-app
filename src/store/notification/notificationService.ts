import { apiService } from '@/services/APIService';
import type {
  NotificationResponse,
  MarkAsReadPayload,
  NotificationAPIResponse,
  InboxSortTypes,
} from './notificationTypes';
import { transformNotification, transformNotificationMeta } from '@/utils/camelCaseKeys';

export class NotificationService {
  static async getNotifications(
    page: number = 1,
    sort_order: InboxSortTypes,
  ): Promise<NotificationResponse> {
    const response = await apiService.get<NotificationAPIResponse>(
      `notifications?sort_order=${sort_order}&includes[]=snoozed&includes[]=read&page=${page}`,
    );
    const { payload, meta } = response.data.data;
    const notifications = payload.map(transformNotification);
    return {
      payload: notifications,
      meta: transformNotificationMeta(meta),
    };
  }

  static async markAllAsRead(): Promise<void> {
    await apiService.post(`notifications/read_all`);
  }

  static async markAsRead(payload: MarkAsReadPayload): Promise<void> {
    await apiService.post(`notifications/read_all`, {
      primary_actor_id: payload.primaryActorId,
      primary_actor_type: payload.primaryActorType,
    });
  }

  static async markAsUnread(notificationId: number): Promise<void> {
    await apiService.post(`notifications/${notificationId}/unread`);
  }

  static async delete(notificationId: number): Promise<void> {
    await apiService.delete(`notifications/${notificationId}`);
  }
}
