import axios from 'axios';
import APIHelper from '../helpers/APIHelper';
import { checkServerSupport } from 'helpers/ServerHelper';
import {
  SET_URL,
  SET_URL_ERROR,
  SET_URL_SUCCESS,
  RESET_SETTINGS,
  SET_LOCALE,
  GET_NOTIFICATION_SETTINGS,
  GET_NOTIFICATION_SETTINGS_ERROR,
  GET_NOTIFICATION_SETTINGS_SUCCESS,
  UPDATE_NOTIFICATION_SETTINGS,
  UPDATE_NOTIFICATION_SETTINGS_SUCCESS,
  UPDATE_NOTIFICATION_SETTINGS_ERROR,
} from '../constants/actions';

import * as RootNavigation from '../helpers/NavigationHelper';
import { showToast } from '../helpers/ToastHelper';
import I18n from '../i18n';
import { URL_TYPE } from '../constants/url';

export const setLocale = value => dispatch => {
  dispatch({ type: SET_LOCALE, payload: value });
};

export const getInstalledVersion = () => async (dispatch, getState) => {
  try {
    const { installationUrl } = await getState().settings;
    const {
      user: { role: userRole },
    } = await getState().auth;
    const result = await axios.get(`${installationUrl}api`);
    const { version: installedVersion } = result.data;
    checkServerSupport({ installedVersion, userRole });
  } catch (error) {}
};

export const setInstallationUrl = ({ url }) => async dispatch => {
  try {
    const INSTALLATION_URL = `${URL_TYPE}${url}/`;
    const WEB_SOCKET_URL = `wss://${url}/cable`;
    dispatch({ type: SET_URL });
    await axios.get(`${INSTALLATION_URL}api`);
    dispatch({
      type: SET_URL_SUCCESS,
      payload: { installationUrl: INSTALLATION_URL, webSocketUrl: WEB_SOCKET_URL, baseUrl: url },
    });

    RootNavigation.navigate('Login');
  } catch (error) {
    showToast({ message: I18n.t('CONFIGURE_URL.ERROR') });
    dispatch({ type: SET_URL_ERROR, payload: error });
  }
};

export const getNotificationSettings = () => async dispatch => {
  dispatch({ type: GET_NOTIFICATION_SETTINGS });
  try {
    const response = await APIHelper.get('notification_settings');
    const { data } = response;
    dispatch({
      type: GET_NOTIFICATION_SETTINGS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: GET_NOTIFICATION_SETTINGS_ERROR, payload: error });
  }
};

export const updateNotificationSettings = preferences => async dispatch => {
  dispatch({ type: UPDATE_NOTIFICATION_SETTINGS });
  try {
    const response = await APIHelper.patch('notification_settings', preferences);
    const { data } = response;
    dispatch({
      type: UPDATE_NOTIFICATION_SETTINGS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: UPDATE_NOTIFICATION_SETTINGS_ERROR, payload: error });
  }
};

export const resetSettings = () => async dispatch => {
  dispatch({ type: RESET_SETTINGS });
};
