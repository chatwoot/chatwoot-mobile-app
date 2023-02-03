import { SET_CONVERSATION_DETAILS } from '../constants/actions';

import axios from '../helpers/APIHelper';
import { actions as inboxAgentActions } from 'reducer/inboxAgentsSlice';

export const getConversationDetails =
  ({ conversationId }) =>
  async dispatch => {
    try {
      const apiUrl = `conversations/${conversationId}`;
      const response = await axios.get(apiUrl);
      const payload = response.data;
      dispatch({
        type: SET_CONVERSATION_DETAILS,
        payload,
      });
      const { inbox_id: inboxId } = payload;
      dispatch(inboxAgentActions.fetchInboxAgents({ inboxId }));
    } catch {}
  };
