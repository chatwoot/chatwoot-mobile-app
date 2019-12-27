import {
  GET_AGENT,
  GET_AGENT_ERROR,
  GET_AGENT_SUCCESS,
} from '../constants/actions';

import axios from '../helpers/APIHelper';

import { API } from '../constants/url';

export const getAgents = () => async dispatch => {
  dispatch({ type: GET_AGENT });
  try {
    const response = await axios.get(`${API}inboxes.json`);
    dispatch({
      type: GET_AGENT_SUCCESS,
      payload: response,
    });
  } catch (error) {
    dispatch({ type: GET_AGENT_ERROR, payload: error });
  }
};
