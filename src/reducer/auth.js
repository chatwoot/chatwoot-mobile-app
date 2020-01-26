import {
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  SET_AUTH_HEADER,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD,
} from '../constants/actions';

export const initialState = {
  user: {},
  headers: {},
  isLogged: false,
  isLoggingIn: false,
  isResettingPassword: false,
  error: {},
  success: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return { ...state, isLoggingIn: true };

    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggingIn: false,
        isLogged: true,
        user: action.payload,
        error: {},
        success: {},
      };
    case LOGIN_ERROR:
      return {
        ...state,
        isLoggingIn: false,
        isLogged: false,
        error: action.payload,
        user: null,
        success: {},
      };
    case RESET_PASSWORD:
      return {
        ...state,
        isResettingPassword: true,
      };
    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        isResettingPassword: false,
        isLogged: true,
        user: {},
        error: {},
        success: {},
      };
    case RESET_PASSWORD_ERROR:
      return {
        ...state,
        isResettingPassword: false,
        isLogged: false,
        error: action.payload,
        user: null,
        success: {},
      };

    case SET_AUTH_HEADER:
      return {
        ...state,
        headers: action.payload,
      };

    default:
      return state;
  }
};
