import { createSlice } from '@reduxjs/toolkit';
import { settingsActions } from './settingsActions';
import * as RootNavigation from '@/utils/navigationUtils';
import { NotificationSettings } from './settingsTypes';
import { Theme } from '@/types/common/Theme';
import type { MobileAppMinVersions } from '@/utils/appUpdateUtils';

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
  mobileAppMinVersions: MobileAppMinVersions;
  // The latest server info request; older responses are ignored.
  serverInfoRequestId: string;
  pushToken: string;
}
const initialState: SettingsState = {
  baseUrl: 'app.chatwoot.com',
  installationUrl: 'https://app.chatwoot.com/',
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
  mobileAppMinVersions: { ios: null, android: null },
  serverInfoRequestId: '',
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
    builder
      .addCase(settingsActions.setInstallationUrl.pending, state => {
        state.uiFlags.isSettingUrl = true;
      })
      .addCase(settingsActions.setInstallationUrl.fulfilled, (state, action) => {
        state.uiFlags.isSettingUrl = false;
        state.installationUrl = action.payload.installationUrl;
        state.baseUrl = action.payload.baseUrl;
        state.mobileAppMinVersions = initialState.mobileAppMinVersions;
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
      .addCase(settingsActions.getChatwootVersion.pending, (state, action) => {
        state.serverInfoRequestId = action.meta.requestId;
      })
      .addCase(settingsActions.getChatwootVersion.fulfilled, (state, action) => {
        // Responses from an older request, or from a server the user has switched away from,
        // would overwrite the current minimum version.
        if (action.meta.requestId !== state.serverInfoRequestId) return;
        if (action.meta.arg.installationUrl !== state.installationUrl) return;
        const { version, mobile_app: mobileApp } = action.payload;
        state.version = version;
        state.mobileAppMinVersions = {
          ios: mobileApp?.min_version?.ios ?? null,
          android: mobileApp?.min_version?.android ?? null,
        };
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
