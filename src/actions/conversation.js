import { SET_CONVERSATION_DETAILS } from '../constants/actions';

import axios from '../helpers/APIHelper';
import { getInboxAgents } from './inbox';

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
      dispatch(getInboxAgents({ inboxId }));
    } catch {}
  };

export const toggleTypingStatus =
  ({ conversationId, typingStatus }) =>
  async dispatch => {
    const apiUrl = `conversations/${conversationId}/toggle_typing_status`;

    await axios
      .post(apiUrl, {
        typing_status: typingStatus,
      })
      .catch();
  };
