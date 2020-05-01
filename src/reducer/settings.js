import {
  SET_URL,
  SET_URL_SUCCESS,
  SET_URL_ERROR,
  RESET_SETTINGS,
  SET_LOCALE,
} from '../constants/actions';
const initialState = {
  installationUrl: null,
  isUrlSet: false,
  isSettingUrl: false,
  localeValue: 'en',
  isLocaleSet: false,
  error: {},
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
        installationUrl: action.payload,
        error: {},
      };
    case SET_URL_ERROR:
      return {
        ...state,
        isSettingUrl: false,
        isUrlSet: false,
        error: action.payload,
        installationUrl: null,
      };

    case RESET_SETTINGS:
      return initialState;

    default:
      return state;
  }
};
