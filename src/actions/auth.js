import axios from '../helpers/APIHelper';
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
} from '../constants/actions';
import { showToast } from '../helpers/ToastHelper';
import I18n from '../i18n';

export const doLogin = ({ email, password }) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN });
    const response = await axios.post('auth/sign_in', { email, password });
    const { data } = response.data;
    const { name: username, id } = data;
    Sentry.setUser({ email, username, id });
    dispatch({ type: SET_AUTH_HEADER, payload: response.headers });
    dispatch({ type: LOGIN_SUCCESS, payload: data });
    dispatch(getAccountDetails());
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
    const response = await axios.post('auth/password', { email });
    const { data } = response;
    showToast(data);

    dispatch({ type: RESET_PASSWORD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: RESET_PASSWORD_ERROR, payload: error });
  }
};

export const getAccountDetails = () => async (dispatch) => {
  try {
    const result = await axios.get('');

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
  dispatch({ type: SET_LOCALE, payload: 'en' });
  dispatch({ type: USER_LOGOUT });
};
