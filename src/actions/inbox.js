import {
  GET_INBOX,
  GET_INBOX_ERROR,
  GET_INBOX_SUCCESS,
  SET_INBOX,
} from '../constants/actions';

import axios from '../helpers/APIHelper';

import { API } from '../constants/url';

const defaultInbox = { id: 0, name: 'All' };
export const getInboxes = () => async dispatch => {
  dispatch({ type: GET_INBOX });
  try {
    const response = await axios.get(`${API}inboxes`);
    let { payload } = response.data;

    payload = [defaultInbox, ...payload];
    dispatch({
      type: GET_INBOX_SUCCESS,
      payload: payload,
    });
    dispatch(setInbox({ inbox: defaultInbox }));
  } catch (error) {
    dispatch({ type: GET_INBOX_ERROR, payload: error });
  }
};

export const setInbox = ({ inbox }) => async dispatch => {
  dispatch({ type: SET_INBOX, payload: inbox });
};
