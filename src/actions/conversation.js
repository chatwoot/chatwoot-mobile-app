import {
  SET_CONVERSATION_DETAILS,
  ADD_OR_UPDATE_USER_TYPING_IN_CONVERSATION,
} from '../constants/actions';

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

export const addUserTypingToConversation =
  ({ conversation, user }) =>
  async (dispatch, getState) => {
    const { id: conversationId } = conversation;
    const { conversationTypingUsers } = await getState().conversation;
    const records = conversationTypingUsers[conversationId] || [];
    const hasUserRecordAlready = !!records.filter(
      record => record.id === user.id && record.type === user.type,
    ).length;
    if (!hasUserRecordAlready) {
      dispatch({
        type: ADD_OR_UPDATE_USER_TYPING_IN_CONVERSATION,
        payload: {
          conversationId,
          users: [...records, user],
        },
      });
    }
  };

export const removeUserFromTypingConversation =
  ({ conversation, user }) =>
  async (dispatch, getState) => {
    const { id: conversationId } = conversation;
    const { conversationTypingUsers } = await getState().conversation;
    const records = conversationTypingUsers[conversationId] || [];
    const updatedUsers = records.filter(
      record => record.id !== user.id || record.type !== user.type,
    );

    dispatch({
      type: ADD_OR_UPDATE_USER_TYPING_IN_CONVERSATION,
      payload: {
        conversationId,
        users: updatedUsers,
      },
    });
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
