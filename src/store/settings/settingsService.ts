import axios from 'axios';
import { apiService, type AccountScopedRequestConfig } from '@/services/APIService';
import type {
  NotificationSettings,
  NotificationSettingsPayload,
  PushPayload,
  VoipPushPayload,
  RemoveDevicePayload,
} from './settingsTypes';

// Servers without calls answer the VoIP subscription with these
const VOIP_SUBSCRIPTION_REFUSALS = [403, 404, 422, 500];

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

  static async getChatwootVersion(installationUrl: string): Promise<{ version: string }> {
    const response = await axios.get(`${installationUrl}api`);
    return response.data;
  }

  static async saveDeviceDetails(payload: PushPayload): Promise<{ fcmToken: string }> {
    const response = await apiService.post<{ fcmToken: string }>(
      'notification_subscriptions',
      payload,
    );
    return response.data;
  }

  static async saveVoipToken(payload: VoipPushPayload): Promise<void> {
    const config: AccountScopedRequestConfig = { quietStatuses: VOIP_SUBSCRIPTION_REFUSALS };
    await apiService.post('notification_subscriptions', payload, config);
  }

  static async removeDevice(payload: RemoveDevicePayload): Promise<void> {
    await apiService.delete('notification_subscriptions', { data: payload });
  }
}
