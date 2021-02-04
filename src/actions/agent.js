import { GET_AGENTS, GET_AGENTS_ERROR, GET_AGENTS_SUCCESS, SET_AGENTS } from '../constants/actions';

import axios from '../helpers/APIHelper';

export const getAgents = () => async (dispatch) => {
  dispatch({ type: GET_AGENTS });
  try {
    const response = await axios.get('agents');
    const { data } = response;
    dispatch({
      type: GET_AGENTS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: GET_AGENTS_ERROR, payload: error });
  }
};

export const setInbox = ({ inbox }) => async (dispatch) => {
  dispatch({ type: SET_AGENTS, payload: inbox });
};
