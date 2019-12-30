import {
  GET_AGENT,
  GET_AGENT_ERROR,
  GET_AGENT_SUCCESS,
  SET_AGENT,
} from '../constants/actions';

import axios from '../helpers/APIHelper';

import { API } from '../constants/url';

export const getAgents = () => async dispatch => {
  dispatch({ type: GET_AGENT });
  try {
    const response = await axios.get(`${API}inboxes.json`);
    const { payload } = response.data;

    dispatch({
      type: GET_AGENT_SUCCESS,
      payload: payload,
    });
  } catch (error) {
    dispatch({ type: GET_AGENT_ERROR, payload: error });
  }
};

export const setAgent = ({ agent }) => async dispatch => {
  dispatch({ type: SET_AGENT, payload: agent });
};
