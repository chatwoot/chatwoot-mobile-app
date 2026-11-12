import axios from 'axios';
import { apiService } from '@/services/APIService';
import {
  getCloudflareAccessCredentials,
  loadCloudflareAccess,
  type CloudflareAccessCredentials,
} from '@/services/cloudflareAccess';
import { createCloudflareAccessAdapter } from '@/services/cloudflareAccessAdapter';
import type {
  NotificationSettings,
  NotificationSettingsPayload,
  PushPayload,
  VoipPushPayload,
  RemoveDevicePayload,
} from './settingsTypes';

export class SettingsService {
  private static async installationInfo(
    url: string,
    credentials?: CloudflareAccessCredentials | null,
  ) {
    if (credentials === undefined) await loadCloudflareAccess();
    const access = credentials === undefined ? getCloudflareAccessCredentials(url) : credentials;
    return axios.get<{ version: string }>(`${url}api`, {
      headers: { Accept: 'application/json' },
      timeout: 15000,
      ...(access ? { adapter: createCloudflareAccessAdapter(new URL(url).origin, access) } : {}),
    });
  }

  static async verifyInstallationUrl(
    url: string,
    credentials?: CloudflareAccessCredentials | null,
  ): Promise<boolean> {
    try {
      const response = await this.installationInfo(url, credentials);
      // Access can redirect to an HTML login page that itself returns HTTP 200.
      return !!response.data && typeof response.data.version === 'string';
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
    const response = await this.installationInfo(installationUrl);
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
    await apiService.post('notification_subscriptions', payload);
  }

  static async removeDevice(payload: RemoveDevicePayload): Promise<void> {
    await apiService.delete('notification_subscriptions', { data: payload });
  }
}
