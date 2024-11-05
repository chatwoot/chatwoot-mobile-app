import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export const selectSettings = (state: RootState) => state.settings;

export const selectInstallationUrl = createSelector(
  selectSettings,
  settings => settings.installationUrl,
);

export const selectLocale = createSelector(selectSettings, settings => settings.localeValue);

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
