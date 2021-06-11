import APIHelper from '../helpers/APIHelper';
import axios from 'axios';
import * as Sentry from '@sentry/react-native';
import {
  LOGIN,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  USER_LOGOUT,
  SET_AUTH_HEADER,
  RESET_PASSWORD,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  RESET_AUTH,
  SET_LOCALE,
  SET_ACCOUNT,
  UPDATE_USER,
  UPDATE_ACTIVITY_STATUS,
  UPDATE_ACTIVITY_STATUS_SUCCESS,
  UPDATE_ACTIVITY_STATUS_ERROR,
} from '../constants/actions';
import { showToast } from '../helpers/ToastHelper';
import I18n from '../i18n';
import { getHeaders } from '../helpers/AuthHelper';
import { getBaseUrl } from '../helpers/UrlHelper';
import { API_URL } from '../constants/url';
import { identifyUser, resetAnalytics } from '../helpers/Analytics';

export const doLogin = ({ email, password }) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN });
    const response = await APIHelper.post('auth/sign_in', { email, password });
    const { data } = response.data;
    const { name: username, id, account_id } = data;
    // Check user has any account
    if (account_id) {
      Sentry.setUser({ email, username, id });
      identifyUser({ userId: id, email, name: username });
      dispatch({ type: SET_AUTH_HEADER, payload: response.headers });
      dispatch({ type: LOGIN_SUCCESS, payload: data });
    } else {
      showToast({ message: I18n.t('ERRORS.NO_ACCOUNTS_MESSAGE') });
      dispatch({ type: LOGIN_ERROR, payload: '' });
    }
  } catch (error) {
    if (error && error.status === 401) {
      showToast({ message: I18n.t('ERRORS.AUTH') });
    }
    dispatch({ type: LOGIN_ERROR, payload: error });
  }
};

export const onResetPassword = ({ email }) => async (dispatch) => {
  try {
    dispatch({ type: RESET_PASSWORD });
    const response = await APIHelper.post('auth/password', { email });
    const { data } = response;
    showToast(data);

    dispatch({ type: RESET_PASSWORD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: RESET_PASSWORD_ERROR, payload: error });
  }
};

export const getAccountDetails = () => async (dispatch) => {
  try {
    const result = await APIHelper.get('');

    const {
      data: { locale },
    } = result;
    dispatch({ type: SET_LOCALE, payload: locale || 'en' });
  } catch (error) {}
};

export const resetAuth = () => async (dispatch) => {
  dispatch({ type: RESET_AUTH });
};

export const onLogOut = () => async (dispatch) => {
  resetAnalytics();
  dispatch({ type: SET_LOCALE, payload: 'en' });
  dispatch({ type: USER_LOGOUT });
};

export const setAccount = ({ accountId }) => async (dispatch) => {
  dispatch({ type: SET_ACCOUNT, payload: accountId });
};
// Add/Update availability status of agents
export const addOrUpdateActiveUsers = ({ users }) => async (dispatch, getState) => {
  const { user: loggedUser } = await getState().auth;
  if (loggedUser) {
    Object.keys(users).forEach((user) => {
      if (parseInt(user) === loggedUser.id) {
        loggedUser.availability_status = users[user];
        dispatch({
          type: UPDATE_USER,
          payload: loggedUser,
        });
      }
    });
  }
};

export const updateAvailabilityStatus = ({ availability }) => async (dispatch) => {
  dispatch({ type: UPDATE_ACTIVITY_STATUS });
  try {
    const headers = await getHeaders();
    const baseUrl = await getBaseUrl();

    await axios.put(
      `${baseUrl}${API_URL}profile`,
      {
        availability,
      },
      {
        headers: headers,
      },
    );

    dispatch({
      type: UPDATE_ACTIVITY_STATUS_SUCCESS,
      payload: availability,
    });
  } catch (error) {
    dispatch({ type: UPDATE_ACTIVITY_STATUS_ERROR, payload: error });
  }
};
