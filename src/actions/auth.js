import axios from '../helpers/APIHelper';

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
} from '../constants/actions';
import { showToast } from '../helpers/ToastHelper';
import I18n from '../i18n';

export const onLogin = ({ email, password }) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN });
    const response = await axios.post('auth/sign_in', { email, password });
    const { data } = response.data;

    dispatch({ type: SET_AUTH_HEADER, payload: response.headers });
    dispatch({ type: LOGIN_SUCCESS, payload: data });
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

export const resetAuth = () => async (dispatch) => {
  dispatch({ type: RESET_AUTH });
};

export const onLogOut = () => async (dispatch) => {
  dispatch({ type: USER_LOGOUT });
};
