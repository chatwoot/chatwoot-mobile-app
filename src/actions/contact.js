import axios from '../helpers/APIHelper';

import {
  GET_CONTACT_CONVERSATIONS,
  GET_CONTACT_CONVERSATIONS_SUCCESS,
  GET_CONTACT_CONVERSATIONS_ERROR,
} from '../constants/actions';

export const getContactConversations = contactId => async dispatch => {
  dispatch({ type: GET_CONTACT_CONVERSATIONS });
  try {
    const apiUrl = `contacts/${contactId}/conversations`;
    const response = await axios.get(apiUrl);
    const { data } = response;
    dispatch({
      type: GET_CONTACT_CONVERSATIONS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: GET_CONTACT_CONVERSATIONS_ERROR, payload: error });
  }
};
