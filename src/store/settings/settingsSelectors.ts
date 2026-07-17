import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export const selectSettings = (state: RootState) => state.settings;

export const selectInstallationUrl = createSelector(
  selectSettings,
  settings => settings.installationUrl,
);

export const selectLocale = createSelector(selectSettings, settings =>
  settings.localeValue === 'zh' ? 'zh_CN' : settings.localeValue,
);

export const selectIsLocaleSet = createSelector(
  selectSettings,
  settings => settings.uiFlags.isLocaleSet,
);

export const selectIsSettingUrl = createSelector(
  selectSettings,
  settings => settings.uiFlags.isSettingUrl,
);

export const selectBaseUrl = createSelector(selectSettings, settings => settings.baseUrl);

export const selectNotificationSettings = createSelector(
  selectSettings,
  settings => settings.notificationSettings,
);

export const selectWebSocketUrl = createSelector(selectSettings, settings => settings.webSocketUrl);

export const selectTheme = createSelector(selectSettings, settings => settings.theme);

// [conomni] m2: ConOmni has no cloud/self-hosted distinction — always false.
// Signature kept as-is (selector over RootState) for minimal diff against upstream.
export const selectIsChatwootCloud = createSelector(selectSettings, () => false);

export const selectChatwootVersion = createSelector(selectSettings, settings => settings.version);

export const selectPushToken = createSelector(selectSettings, settings => settings.pushToken);
