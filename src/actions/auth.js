import axios from '../helpers/APIHelper';

import {
  LOGIN,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  USER_LOGOUT,
} from '../constants/actions';

export const onLogin = ({ email, password }) => async dispatch => {
  try {
    dispatch({ type: LOGIN });
    const response = await axios.post('/auth/sign_in', { email, password });
    const { data } = response.data;
    dispatch({ type: LOGIN_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: LOGIN_ERROR, payload: error });
  }
};

export const onLogOut = () => async dispatch => {
  dispatch({ type: USER_LOGOUT });
};
