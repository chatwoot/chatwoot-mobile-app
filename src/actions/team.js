import axios from '../helpers/APIHelper';

import {
  GET_ALL_TEAMS,
  GET_ALL_TEAMS_SUCCESS,
  GET_ALL_TEAMS_ERROR,
  ASSIGN_TEAM,
  ASSIGN_TEAM_SUCCESS,
  ASSIGN_TEAM_ERROR,
} from '../constants/actions';
import { pop } from '../helpers/NavigationHelper';

import { getConversationDetails } from './conversation';

export const getAllTeams = () => async dispatch => {
  dispatch({ type: GET_ALL_TEAMS });
  try {
    const apiUrl = 'teams';
    const response = await axios.get(apiUrl);
    const { data } = response;
    dispatch({
      type: GET_ALL_TEAMS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: GET_ALL_TEAMS_ERROR, payload: error });
  }
};

export const assignTeam =
  ({ conversationId, teamId }) =>
  async (dispatch, getState) => {
    dispatch({ type: ASSIGN_TEAM });
    try {
      const params = { team_id: teamId };
      const apiUrl = `conversations/${conversationId}/assignments`;
      await axios.post(apiUrl, params);
      dispatch({ type: ASSIGN_TEAM_SUCCESS });
      dispatch(getConversationDetails({ conversationId }));
      pop(1);
    } catch (error) {
      dispatch({ type: ASSIGN_TEAM_ERROR });
    }
  };
