import {
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  SET_AUTH_HEADER,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD,
  RESET_AUTH,
  SET_ACCOUNT,
  UPDATE_USER,
  UPDATE_ACTIVITY_STATUS,
  UPDATE_ACTIVITY_STATUS_SUCCESS,
  UPDATE_ACTIVITY_STATUS_ERROR,
} from '../constants/actions';

export const initialState = {
  user: {},
  headers: {},
  isLoggedIn: false,
  isLoggingIn: false,
  isResettingPassword: false,
  isUpdating: true,
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
        isLoggedIn: true,
        user: action.payload,
        error: {},
        success: {},
      };
    case LOGIN_ERROR:
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: false,
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
        success: {},
      };
    case RESET_PASSWORD_ERROR:
      return {
        ...state,
        isResettingPassword: false,
        error: action.payload,
      };
    case RESET_AUTH:
      return {
        initialState,
      };
    case SET_AUTH_HEADER:
      return {
        ...state,
        headers: action.payload,
      };

    case SET_ACCOUNT:
      return {
        ...state,
        user: {
          ...state.user,
          account_id: action.payload,
        },
      };

    case UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };

    case UPDATE_ACTIVITY_STATUS: {
      return {
        ...state,
        isUpdating: true,
      };
    }

    case UPDATE_ACTIVITY_STATUS_SUCCESS: {
      return {
        ...state,
        user: {
          ...state.user,
          availability_status: action.payload,
        },
        isUpdating: false,
      };
    }

    case UPDATE_ACTIVITY_STATUS_ERROR: {
      return {
        ...state,
        isUpdating: false,
      };
    }

    default:
      return state;
  }
};
