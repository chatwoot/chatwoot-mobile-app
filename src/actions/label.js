import axios from '../helpers/APIHelper';

import {
  GET_ALL_LABELS,
  GET_ALL_LABELS_SUCCESS,
  GET_ALL_LABELS_ERROR,
  GET_CONVERSATION_LABELS,
  UPDATE_CONVERSATION_LABELS_SUCCESS,
  GET_CONVERSATION_LABELS_SUCCESS,
  GET_CONVERSATION_LABELS_ERROR,
} from '../constants/actions';

import { getConversationDetails } from './conversation';

export const getAllLabels = () => async dispatch => {
  dispatch({ type: GET_ALL_LABELS });
  try {
    const apiUrl = 'labels';
    const response = await axios.get(apiUrl);
    const { data } = response;
    dispatch({
      type: GET_ALL_LABELS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: GET_ALL_LABELS_ERROR, payload: error });
  }
};

export const getConversationLabels =
  ({ conversationId }) =>
  async dispatch => {
    dispatch({ type: GET_CONVERSATION_LABELS });
    try {
      const apiUrl = `conversations/${conversationId}/labels`;
      const response = await axios.get(apiUrl);
      const { data } = response;
      dispatch({
        type: GET_CONVERSATION_LABELS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({ type: GET_CONVERSATION_LABELS_ERROR, payload: error });
    }
  };

export const updateConversationLabels =
  ({ conversationId, labels }) =>
  async dispatch => {
    try {
      const params = { labels: labels };
      const apiUrl = `conversations/${conversationId}/labels`;
      const response = await axios.post(apiUrl, params);
      const { data } = response;
      dispatch({
        type: UPDATE_CONVERSATION_LABELS_SUCCESS,
        payload: data,
      }).then(() => {
        dispatch(getConversationDetails({ conversationId }));
      });
    } catch (error) {}
  };
