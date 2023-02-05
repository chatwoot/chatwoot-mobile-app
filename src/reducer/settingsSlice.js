import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

import APIHelper from 'helpers/APIHelper';
import { URL_TYPE } from 'constants/url';
import { showToast } from 'helpers/ToastHelper';
import I18n from 'i18n';
import * as RootNavigation from 'helpers/NavigationHelper';

const settingAdapter = createEntityAdapter();
export const actions = {
  setInstallationUrl: createAsyncThunk(
    'settings/setInstallationUrl',
    async ({ url }, { rejectWithValue }) => {
      try {
        const INSTALLATION_URL = `${URL_TYPE}${url}/`;
        const WEB_SOCKET_URL = `wss://${url}/cable`;
        await axios.get(`${INSTALLATION_URL}api`);
        RootNavigation.navigate('Login');
        return { installationUrl: INSTALLATION_URL, webSocketUrl: WEB_SOCKET_URL, baseUrl: url };
      } catch (error) {
        showToast({ message: I18n.t('CONFIGURE_URL.ERROR') });
        return rejectWithValue(error);
      }
    },
  ),
  getNotificationSettings: createAsyncThunk('settings/getNotificationSettings', async () => {
    const response = await APIHelper.get('notification_settings');
    const { data } = response;
    return data;
  }),
  updateNotificationSettings: createAsyncThunk(
    'settings/updateNotificationSettings',
    async preferences => {
      const response = await APIHelper.put('notification_settings', preferences);
      const { data } = response;
      return data;
    },
  ),
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingAdapter.getInitialState({
    baseUrl: '',
    installationUrl: null,
    isLocaleSet: false,
    isSettingUrl: false,
    isUpdating: false,
    isUrlSet: false,
    localeValue: 'en',
    notification: {},
    webSocketUrl: null,
  }),
  reducers: {
    resetSettings: state => {
      state.isSettingUrl = false;
      state.isUpdating = false;
    },
    setLocale: (state, action) => {
      state.localeValue = action.payload;
      state.isLocaleSet = true;
    },
  },
  extraReducers: {
    [actions.setInstallationUrl.pending]: state => {
      state.isSettingUrl = true;
    },
    [actions.setInstallationUrl.fulfilled]: (state, action) => {
      state.isSettingUrl = false;
      state.isUrlSet = true;
      state.installationUrl = action.payload.installationUrl;
      state.baseUrl = action.payload.baseUrl;
      state.webSocketUrl = action.payload.webSocketUrl;
    },
    [actions.setInstallationUrl.rejected]: state => {
      state.isSettingUrl = false;
      state.isUrlSet = false;
      state.installationUrl = null;
      state.baseUrl = '';
    },
    [actions.getNotificationSettings.fulfilled]: (state, action) => {
      state.notification = action.payload;
    },
    [actions.updateNotificationSettings.pending]: (state, action) => {
      state.isUpdating = false;
    },
    [actions.updateNotificationSettings.fulfilled]: (state, action) => {
      state.notification = action.payload;
    },
    [actions.updateNotificationSettings.rejected]: (state, action) => {
      state.isUpdating = false;
    },
  },
});

export const { resetSettings, setLocale } = settingsSlice.actions;

export const selectUrlSet = state => state.settings.isUrlSet;

export const selectInstallationUrl = state => state.settings.installationUrl;

export const selectBaseUrl = state => state.settings.baseUrl;

export const selectWebSocketUrl = state => state.settings.webSocketUrl;

export const selectNotificationSettings = state => state.settings.notification;

export const selectLocale = state => state.settings.localeValue;

export const selectLocaleSet = state => state.settings.isLocaleSet;

export const selectIsSettingUrl = state => state.settings.isSettingUrl;

export const selectIsUpdating = state => state.settings.isUpdating;

export default settingsSlice.reducer;
