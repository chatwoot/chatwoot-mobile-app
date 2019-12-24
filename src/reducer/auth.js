import { LOGIN, LOGIN_SUCCESS, LOGIN_ERROR } from '../constants/actions';

const initialState = {
  user: {},
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

    default:
      return state;
  }
};
