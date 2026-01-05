import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react-native';

import I18n from '@/i18n';
import { backendService } from '@/services/BackendService';
import { showToast } from '@/utils/toastUtils';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import {
    getApiLevel,
    getBrand,
    getBuildNumber,
    getManufacturer,
    getModel,
    getSystemName,
    getUniqueId,
} from 'react-native-device-info';
import { SettingsService } from './settingsService';
import {
    InstallationUrls,
    NotificationSettings,
    NotificationSettingsPayload,
} from './settingsTypes';
import { checkValidUrl, extractDomain, handleApiError } from './settingsUtils';

export const URL_TYPE = 'https://';

function createSettingsThunk<TResponse, TPayload>(
  type: string,
  handler: (payload: TPayload) => Promise<TResponse>,
  errorMessage?: string,
) {
  return createAsyncThunk<TResponse, TPayload>(type, async (payload, { rejectWithValue }) => {
    try {
      return await handler(payload);
    } catch (error) {
      return rejectWithValue(handleApiError(error, errorMessage));
    }
  });
}

export const settingsActions = {
  setInstallationUrl: createAsyncThunk<InstallationUrls, string>(
    'settings/setInstallationUrl',
    async (url, { rejectWithValue }) => {
      try {
        if (!checkValidUrl({ url })) {
          throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
        }

        const installationUrl = extractDomain({ url });
        const INSTALLATION_URL = `${URL_TYPE}${installationUrl}/`;
        const WEB_SOCKET_URL = `wss://${url}/cable`;
        const isValid = await SettingsService.verifyInstallationUrl(INSTALLATION_URL);

        if (!isValid) {
          throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
        }

        return {
          installationUrl: INSTALLATION_URL,
          webSocketUrl: WEB_SOCKET_URL,
          baseUrl: installationUrl,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : I18n.t('CONFIGURE_URL.ERROR');
        showToast({ message });
        return rejectWithValue(message);
      }
    },
  ),

  getNotificationSettings: createSettingsThunk<NotificationSettings, void>(
    'settings/getNotificationSettings',
    () => SettingsService.getNotificationSettings(),
  ),

  updateNotificationSettings: createSettingsThunk<
    NotificationSettings,
    NotificationSettingsPayload
  >('settings/updateNotificationSettings', SettingsService.updateNotificationSettings),

  getAppVersion: createSettingsThunk<{ version: string }, { installationUrl: string }>(
    'settings/getAppVersion',
    ({ installationUrl }) => SettingsService.getAppVersion(installationUrl),
  ),

  saveDeviceDetails: createAsyncThunk<{ fcmToken: string }, void>(
    'settings/saveDeviceDetails',
    async (_, { rejectWithValue, getState }) => {
      try {
        // Get permissions and device info
        const permissionEnabled = await messaging().hasPermission();
        const deviceId = await getUniqueId();
        const devicePlatform = getSystemName();
        const manufacturer = await getManufacturer();
        const model = await getModel();
        const apiLevel = await getApiLevel();
        const deviceName = `${manufacturer} ${model}`;
        const brandName = await getBrand();
        const buildNumber = await getBuildNumber();

        const isAndroidAPILevelGreater32 = apiLevel > 32 && Platform.OS === 'android';

        // Request permissions if needed
        if (!permissionEnabled || permissionEnabled === -1) {
          if (isAndroidAPILevelGreater32) {
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          }
          await messaging().requestPermission();
        }

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // Register for remote messages on iOS
        if (Platform.OS === 'ios') {
          await messaging().registerDeviceForRemoteMessages();
        }

        // Wait for FCM to initialize
        await sleep(1000);
        const fcmToken = await messaging().getToken();

        // ❌ REMOVED: Don't send to Chatwoot instance
        // await SettingsService.saveDeviceDetails(pushData);

        // ✅ NEW: Send to NOTCHAT backend instead
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = getState() as any; // Use any to avoid RootState import issues
        const { installationUrl } = state.settings;
        const { user, headers, apiAccessToken } = state.auth;

        if (!user || !headers) {
          throw new Error('User not authenticated');
        }

        // Normalize platform to lowercase for Laravel validation
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        const normalizedDevicePlatform = devicePlatform.toLowerCase();

        // PRIORIDADE: Usar API Access Token se disponível (token de integração)
        // FALLBACK: Usar token de autenticação (token de sessão)
        // apiAccessToken já foi extraído do state acima
        const authToken = headers['access-token'];
        const accessToken = apiAccessToken || authToken;

        // Log para debug
        console.log('[NOTCHAT] Registering device with backend...');
        console.log('[NOTCHAT] FCM Token:', fcmToken.substring(0, 50) + '...');
        console.log('[NOTCHAT] Platform:', platform);
        console.log('[NOTCHAT] Device Platform:', normalizedDevicePlatform);
        console.log('[NOTCHAT] Backend URL:', backendService.getBaseUrl());
        console.log('[NOTCHAT] Account ID:', user.account_id || 'NOT AVAILABLE');
        console.log(
          '[NOTCHAT] Token type:',
          apiAccessToken ? 'API Access Token' : 'Auth Token (fallback)',
        );
        console.log(
          '[NOTCHAT] Token (first 20 chars):',
          accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT AVAILABLE',
        );

        // Se não tiver nenhum token, ainda podemos registrar se tiver account_id
        if (!accessToken && !user.account_id) {
          throw new Error('Access token ou account_id não encontrado. Faça login novamente.');
        }

        await backendService.registerDevice({
          chatwoot_url: installationUrl,
          agent_id: user.id,
          agent_email: user.email,
          // Enviar access_token apenas se disponível (opcional se account_id for fornecido)
          ...(accessToken && { access_token: accessToken }),
          account_id: user.account_id, // Enviar account_id que já temos no frontend
          fcm_token: fcmToken,
          platform: platform,
          device_info: {
            device_name: deviceName,
            device_platform: normalizedDevicePlatform,
            api_level: apiLevel.toString(),
            brand_name: brandName,
            build_number: buildNumber,
            device_id: deviceId,
          },
        });

        // Salvar token FCM no AsyncStorage para uso futuro em atualizações
        await AsyncStorage.setItem('fcm_token', fcmToken);

        console.log('[NOTCHAT] Device registered with backend successfully');
        return { fcmToken };
      } catch (error) {
        // Tratamento específico para Rate Limit (429) - não tentar novamente
        if (error instanceof Error && error.message.includes('Muitas tentativas')) {
          console.warn(
            '[NOTCHAT] Rate limit atingido. Registro do dispositivo será tentado novamente mais tarde.',
          );
          // Não salvar o token se rate limit foi atingido - tentará novamente na próxima vez
          return rejectWithValue(
            'Rate limit atingido. Aguarde um momento antes de tentar novamente.',
          );
        }

        // Verificar se é erro de token inválido
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isTokenError =
          errorMessage.includes('Access token inválido') ||
          errorMessage.includes('token inválido') ||
          errorMessage.includes('token não autorizado') ||
          errorMessage.includes('invalid token') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('401') ||
          errorMessage.includes('403') ||
          errorMessage.includes('Verifique o token no Chatwoot') ||
          errorMessage.includes('configure o token de acesso manualmente');

        if (isTokenError) {
          // Retornar erro específico para que o LoginScreen possa detectar
          return rejectWithValue({
            message: 'Token de acesso inválido. Por favor, faça login novamente.',
            isTokenError: true,
          });
        }

        Sentry.captureException(error);
        return rejectWithValue(
          error instanceof Error ? error.message : 'Error saving device details',
        );
      }
    },
  ),

  // New action to register with backend after login
  registerWithBackend: createAsyncThunk<void, void>(
    'settings/registerWithBackend',
    async (_, { dispatch }) => {
      await dispatch(settingsActions.saveDeviceDetails()).unwrap();
    },
  ),

  removeDevice: createSettingsThunk<void, { pushToken: string }>(
    'settings/removeDevice',
    ({ pushToken }) => SettingsService.removeDevice({ push_token: pushToken }),
  ),
  
  // New action to verify instance registration before login
  verifyInstance: createAsyncThunk<void, string>(
    'settings/verifyInstance',
    async (installationUrl, { rejectWithValue }) => {
      try {
        await backendService.verifyInstance(installationUrl);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        showToast({ message });
        return rejectWithValue(message);
      }
    },
  ),
};
