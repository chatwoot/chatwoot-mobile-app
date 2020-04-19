import axios from 'axios';

import {
  SET_URL,
  SET_URL_ERROR,
  SET_URL_SUCCESS,
  RESET_SETTINGS,
} from '../constants/actions';
import * as RootNavigation from '../helpers/NavigationHelper';
import { showToast } from '../helpers/ToastHelper';
import I18n from '../i18n';

export const setInstallationUrl = ({ url }) => async (dispatch) => {
  try {
    dispatch({ type: SET_URL });
    const BASE_URL = `https://${url}/`;
    await axios.get(`${BASE_URL}api`);
    dispatch({ type: SET_URL_SUCCESS, payload: BASE_URL });
    RootNavigation.navigate('Login');
  } catch (error) {
    showToast({ message: I18n.t('CONFIGURE_URL.ERROR') });
    dispatch({ type: SET_URL_ERROR, payload: error });
  }
};

export const resetSettings = () => async (dispatch) => {
  dispatch({ type: RESET_SETTINGS });
};
