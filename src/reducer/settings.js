import {
  SET_URL,
  SET_URL_SUCCESS,
  SET_URL_ERROR,
  RESET_SETTINGS,
  SET_LOCALE,
  GET_NOTIFICATION_SETTINGS,
  GET_NOTIFICATION_SETTINGS_SUCCESS,
  GET_NOTIFICATION_SETTINGS_ERROR,
  UPDATE_NOTIFICATION_SETTINGS,
  UPDATE_NOTIFICATION_SETTINGS_SUCCESS,
  UPDATE_NOTIFICATION_SETTINGS_ERROR,
} from '../constants/actions';
const initialState = {
  baseUrl: '',
  error: {},
  installationUrl: null,
  isLocaleSet: false,
  isSettingUrl: false,
  isUpdating: false,
  isUrlSet: false,
  localeValue: 'en',
  notificationSettings: {},
  webSocketUrl: null,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCALE:
      return {
        ...state,
        localeValue: action.payload,
        isLocaleSet: true,
      };

    case SET_URL:
      return { ...state, isSettingUrl: true };

    case SET_URL_SUCCESS:
      return {
        ...state,
        isSettingUrl: false,
        isUrlSet: true,
        installationUrl: action.payload.installationUrl,
        baseUrl: action.payload.baseUrl,
        webSocketUrl: action.payload.webSocketUrl,
        error: {},
      };
    case SET_URL_ERROR:
      return {
        ...state,
        isSettingUrl: false,
        isUrlSet: false,
        error: action.payload,
        installationUrl: null,
        baseUrl: '',
      };

    case RESET_SETTINGS:
      return initialState;

    case GET_NOTIFICATION_SETTINGS: {
      return {
        ...state,
      };
    }

    case GET_NOTIFICATION_SETTINGS_SUCCESS: {
      return {
        ...state,
        notificationSettings: action.payload,
      };
    }

    case GET_NOTIFICATION_SETTINGS_ERROR: {
      return {
        ...state,
        isFetching: false,
        notificationSettings: {},
      };
    }

    case UPDATE_NOTIFICATION_SETTINGS: {
      return {
        ...state,
        isUpdating: true,
      };
    }

    case UPDATE_NOTIFICATION_SETTINGS_SUCCESS: {
      return {
        ...state,
        notificationSettings: action.payload,
        isUpdating: false,
      };
    }

    case UPDATE_NOTIFICATION_SETTINGS_ERROR: {
      return {
        ...state,
        isFetching: false,
        isUpdating: false,
        notificationSettings: {},
      };
    }

    default:
      return state;
  }
};
