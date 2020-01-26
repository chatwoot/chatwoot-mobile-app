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
} from '../constants/actions';

export const onLogin = ({ email, password }) => async dispatch => {
  try {
    dispatch({ type: LOGIN });
    const response = await axios.post('auth/sign_in', { email, password });
    const { data } = response.data;
    dispatch({ type: LOGIN_SUCCESS, payload: data });
    dispatch({ type: SET_AUTH_HEADER, payload: response.headers });
  } catch (error) {
    dispatch({ type: LOGIN_ERROR, payload: error });
  }
};

export const onResetPassword = ({ email }) => async dispatch => {
  try {
    dispatch({ type: RESET_PASSWORD });
    const response = await axios.post('auth/password', { email });
    const { data } = response.data;
    dispatch({ type: RESET_PASSWORD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: RESET_PASSWORD_ERROR, payload: error });
  }
};

export const onLogOut = () => async dispatch => {
  dispatch({ type: USER_LOGOUT });
};
