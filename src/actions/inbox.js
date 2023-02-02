import { GET_INBOX, GET_INBOX_ERROR, GET_INBOX_SUCCESS } from '../constants/actions';

import axios from 'helpers/APIHelper';

const defaultInbox = { id: 0, name: 'All', channel_type: 'Channel::All' };
export const getInboxes = () => async dispatch => {
  dispatch({ type: GET_INBOX });
  try {
    const response = await axios.get('inboxes');
    let { payload } = response.data;

    payload = [defaultInbox, ...payload];
    dispatch({
      type: GET_INBOX_SUCCESS,
      payload: payload,
    });
  } catch (error) {
    dispatch({ type: GET_INBOX_ERROR });
  }
};
