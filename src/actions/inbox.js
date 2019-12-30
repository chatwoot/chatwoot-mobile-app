import {
  GET_INBOX,
  GET_INBOX_ERROR,
  GET_INBOX_SUCCESS,
  SET_INBOX,
} from '../constants/actions';

import axios from '../helpers/APIHelper';

import { API } from '../constants/url';

export const getInboxes = () => async dispatch => {
  dispatch({ type: GET_INBOX });
  try {
    const response = await axios.get(`${API}inboxes.json`);
    const { payload } = response.data;

    dispatch({
      type: GET_INBOX_SUCCESS,
      payload: payload,
    });
  } catch (error) {
    dispatch({ type: GET_INBOX_ERROR, payload: error });
  }
};

export const setInbox = ({ inbox }) => async dispatch => {
  dispatch({ type: SET_INBOX, payload: inbox });
};
