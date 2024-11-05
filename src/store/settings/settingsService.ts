import axios from 'axios';
import { apiService } from '@/services/APIService';
import type { NotificationSettings, NotificationSettingsPayload } from './settingsTypes';

export class SettingsService {
  static async verifyInstallationUrl(url: string): Promise<boolean> {
    try {
      await axios.get(`${url}api`);
      return true;
    } catch {
      return false;
    }
  }

  static async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiService.get<NotificationSettings>('notification_settings');
    return response.data;
  }

  static async updateNotificationSettings(
    payload: NotificationSettingsPayload,
  ): Promise<NotificationSettings> {
    const response = await apiService.put<NotificationSettings>('notification_settings', payload);
    return response.data;
  }
}
