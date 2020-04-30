import axios from 'axios';

import {
  SET_URL,
  SET_URL_ERROR,
  SET_URL_SUCCESS,
  RESET_SETTINGS,
  SET_LOCALE,
} from '../constants/actions';

import * as RootNavigation from '../helpers/NavigationHelper';
import { showToast } from '../helpers/ToastHelper';
import I18n from '../i18n';
import { URL_TYPE } from '../constants/url';

export const setLocale = (value) => (dispatch) => {
  dispatch({ type: SET_LOCALE, payload: value });
};

export const setInstallationUrl = ({ url }) => async (dispatch) => {
  try {
    const BASE_URL = `${URL_TYPE}${url}/`;
    dispatch({ type: SET_URL });
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
