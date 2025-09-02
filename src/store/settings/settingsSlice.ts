import { createSlice } from '@reduxjs/toolkit';
import { settingsActions } from './settingsActions';
import * as RootNavigation from '@/utils/navigationUtils';
import { NotificationSettings } from './settingsTypes';
import { Theme } from '@/types/common/Theme';

interface SettingsState {
  baseUrl: string;
  installationUrl: string;
  uiFlags: {
    isSettingUrl: boolean;
    isUpdating: boolean;
    isLocaleSet: boolean;
  };
  notificationSettings: NotificationSettings;
  localeValue: string;
  webSocketUrl: string;
  theme: Theme;
  version: string;
  pushToken: string;
}

const initialState: SettingsState = {
  baseUrl: process.env.EXPO_PUBLIC_BASE_URL as string,
  installationUrl: process.env.EXPO_PUBLIC_INSTALLATION_URL as string,
  uiFlags: {
    isSettingUrl: false,
    isUpdating: false,
    isLocaleSet: false,
  },
  localeValue: 'en',
  notificationSettings: {
    account_id: 0,
    all_email_flags: [],
    all_push_flags: [],
    id: 0,
    selected_email_flags: [],
    selected_push_flags: [],
    user_id: 0,
  },
  webSocketUrl: 'wss://app.chatwoot.com/cable',
  theme: 'system',
  version: '',
  pushToken: '',
};
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetSettings: state => {
      state.uiFlags.isSettingUrl = false;
      state.uiFlags.isUpdating = false;
    },
    setLocale: (state, action) => {
      state.localeValue = action.payload;
      state.uiFlags.isLocaleSet = true;
    },
  },
  extraReducers: builder => {
    // Log when Redux Persist rehydrates the state
    builder.addCase('persist/REHYDRATE', (state, action: any) => {
      if (action.payload?.settings) {
        console.log('🔄 Redux Persist REHYDRATE - Settings restored from storage:', {
          persistedBaseUrl: action.payload.settings.baseUrl,
          persistedInstallationUrl: action.payload.settings.installationUrl,
          currentEnvBaseUrl: process.env.EXPO_PUBLIC_BASE_URL,
          currentEnvInstallationUrl: process.env.EXPO_PUBLIC_INSTALLATION_URL,
          environment: process.env.ENVIRONMENT || process.env.EAS_BUILD_PROFILE || 'unknown',
          'WARNING': 'Persisted URLs may override environment variables!'
        });
      }
    });

    builder
      .addCase(settingsActions.setInstallationUrl.pending, state => {
        state.uiFlags.isSettingUrl = true;
      })
      .addCase(settingsActions.setInstallationUrl.fulfilled, (state, action) => {
        state.uiFlags.isSettingUrl = false;
        state.installationUrl = action.payload.installationUrl;
        state.baseUrl = action.payload.baseUrl;
        state.webSocketUrl = action.payload.webSocketUrl;
        RootNavigation.navigate('Login');
      })
      .addCase(settingsActions.setInstallationUrl.rejected, state => {
        state.uiFlags.isSettingUrl = false;
        state.installationUrl = '';
        state.baseUrl = '';
      })
      .addCase(settingsActions.getNotificationSettings.fulfilled, (state, action) => {
        state.notificationSettings = action.payload;
      })
      .addCase(settingsActions.updateNotificationSettings.pending, state => {
        state.uiFlags.isUpdating = true;
      })
      .addCase(settingsActions.updateNotificationSettings.fulfilled, (state, action) => {
        state.uiFlags.isUpdating = false;
        state.notificationSettings = action.payload;
      })
      .addCase(settingsActions.updateNotificationSettings.rejected, state => {
        state.uiFlags.isUpdating = false;
      })
      .addCase(settingsActions.getChatwootVersion.fulfilled, (state, action) => {
        const { version } = action.payload;
        state.version = version;
      })
      .addCase(settingsActions.saveDeviceDetails.fulfilled, (state, action) => {
        if (action?.payload?.fcmToken) {
          state.pushToken = action.payload.fcmToken;
        }
      })
      .addCase(settingsActions.saveDeviceDetails.rejected, (state, action) => {
        state.pushToken = '';
      });
  },
});
export const { resetSettings, setLocale } = settingsSlice.actions;
export default settingsSlice.reducer;
