export interface NotificationFlag {
  id: string;
  name: string;
  enabled: boolean;
}

export interface NotificationSettings {
  id: number;
  user_id: number;
  account_id: number;
  all_email_flags: string[];
  selected_email_flags: string[];
  all_push_flags: string[];
  selected_push_flags: string[];
}

export interface NotificationSettingsPayload {
  notification_settings: {
    selected_email_flags: string[];
    selected_push_flags: string[];
  };
}

export interface InstallationUrls {
  installationUrl: string;
  webSocketUrl: string;
  baseUrl: string;
}

export interface SettingsState extends InstallationUrls {
  uiFlags: {
    isSettingUrl: boolean;
    isUpdating: boolean;
    isLocaleSet: boolean;
  };
  notificationSettings: NotificationSettings | null;
  localeValue: string;
}
