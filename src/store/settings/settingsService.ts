import axios from 'axios';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import { apiService } from '@/services/APIService';
import type {
  NotificationSettings,
  NotificationSettingsPayload,
  PushPayload,
  VoipPushPayload,
  RemoveDevicePayload,
} from './settingsTypes';

export const HTTPS_PROBE_TIMEOUT_MS = 5000;

const waitForAppToBecomeActive = (): Promise<boolean> => {
  if (AppState.currentState === 'active') {
    return Promise.resolve(true);
  }
  if (AppState.currentState !== 'inactive') {
    return Promise.resolve(false);
  }
  return new Promise(resolve => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        subscription?.remove();
        resolve(true);
      } else if (nextState !== 'inactive') {
        subscription?.remove();
        resolve(false);
      }
    });
  });
};

export class SettingsService {
  static async verifyInstallationUrl(
    url: string,
    options?: { timeout?: number },
  ): Promise<boolean> {
    const normalizedUrl = url.endsWith('/') ? url : `${url}/`;
    const performRequest = () =>
      options?.timeout !== undefined
        ? axios.get(`${normalizedUrl}api`, { timeout: options.timeout })
        : axios.get(`${normalizedUrl}api`);

    let becameInactive = Platform.OS === 'ios' && AppState.currentState === 'inactive';
    let wentToBackground = false;
    const subscription =
      Platform.OS === 'ios'
        ? AppState.addEventListener('change', (nextState: AppStateStatus) => {
            if (nextState === 'inactive') {
              becameInactive = true;
            } else if (nextState === 'background') {
              wentToBackground = true;
            }
          })
        : null;

    let initialError: unknown = null;
    try {
      await performRequest();
      return true;
    } catch (error) {
      initialError = error;
    } finally {
      subscription?.remove();
    }

    // On iOS 14+, the first LAN request triggers the Local Network consent prompt
    // (putting AppState into 'inactive'). If the request fails or times out without an
    // HTTP response while that prompt is pending, wait for dismissal and retry once.
    const hasHttpResponse = axios.isAxiosError(initialError) && Boolean(initialError.response);
    if (Platform.OS === 'ios' && becameInactive && !wentToBackground && !hasHttpResponse) {
      const isActiveAgain = await waitForAppToBecomeActive();
      if (isActiveAgain) {
        try {
          await performRequest();
          return true;
        } catch {
          return false;
        }
      }
    }

    return false;
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
    await apiService.post('notification_subscriptions', payload);
  }

  static async removeDevice(payload: RemoveDevicePayload): Promise<void> {
    await apiService.delete('notification_subscriptions', { data: payload });
  }
}
