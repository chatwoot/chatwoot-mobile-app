import {
  SET_URL,
  SET_URL_ERROR,
  SET_URL_SUCCESS,
  RESET_SETTINGS,
} from '../constants/actions';
import * as RootNavigation from '../helpers/NavigationHelper';

export const setInstallationUrl = ({ url }) => async (dispatch) => {
  try {
    dispatch({ type: SET_URL });
    dispatch({ type: SET_URL_SUCCESS, payload: `https://${url}/` });
    RootNavigation.navigate('Login');
  } catch (error) {
    dispatch({ type: SET_URL_ERROR, payload: error });
  }
};

export const resetSettings = () => async (dispatch) => {
  dispatch({ type: RESET_SETTINGS });
};
