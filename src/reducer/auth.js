import {
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  SET_AUTH_HEADER,
} from '../constants/actions';

const initialState = {
  user: {},
  headers: {},
  isLogged: false,
  isLoggingIn: false,
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

    case SET_AUTH_HEADER:
      return {
        ...state,
        headers: action.payload,
      };

    default:
      return state;
  }
};
