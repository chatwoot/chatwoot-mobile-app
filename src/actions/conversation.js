import {
  GET_CONVERSATION,
  GET_CONVERSATION_ERROR,
  GET_CONVERSATION_SUCCESS,
} from '../constants/actions';

import axios from '../helpers/APIHelper';

import { API } from '../constants/url';

export const getConversations = ({ assigneeType }) => async dispatch => {
  dispatch({ type: GET_CONVERSATION });
  try {
    const response = await axios.get(
      `${API}conversations?status=open&assignee_type_id=${assigneeType}`,
    );
    const { data } = response.data;
    dispatch({
      type: GET_CONVERSATION_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: GET_CONVERSATION_ERROR, payload: error });
  }
};
