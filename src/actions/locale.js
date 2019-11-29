import { SET_LOCALE } from '../constants/actions';

export const setLocale = value => dispatch => {
  dispatch({ type: SET_LOCALE, payload: value });
};
