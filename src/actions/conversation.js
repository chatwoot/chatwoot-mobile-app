import {
  GET_CONVERSATION,
  GET_CONVERSATION_ERROR,
  GET_CONVERSATION_SUCCESS,
  SET_CONVERSATION_STATUS,
  ADD_CONVERSATION,
  ADD_MESSAGE,
  GET_MESSAGES,
  GET_MESSAGES_SUCCESS,
  GET_MESSAGES_ERROR,
  UPDATE_CONVERSATION,
  UPDATE_MESSAGE,
  GET_MORE_MESSAGES,
  GET_MORE_MESSAGES_SUCCESS,
  GET_MORE_MESSAGES_ERROR,
  ALL_MESSAGES_LOADED,
  SEND_MESSAGE,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_ERROR,
} from '../constants/actions';

import axios from '../helpers/APIHelper';

import { API } from '../constants/url';
// Load all the conversations
export const getConversations = ({
  assigneeType,
  conversationStatus,
  inboxSelected,
}) => async dispatch => {
  dispatch({ type: GET_CONVERSATION });
  try {
    const status = conversationStatus === 'Open' ? 'open' : 'resolved';
    const inbox_id = inboxSelected && inboxSelected ? inboxSelected.id : null;
    const apiUrl = `${API}conversations?${
      inbox_id ? `inbox_id=${inbox_id}&` : ''
    }status=${status}&assignee_type_id=${assigneeType}`;

    const response = await axios.get(apiUrl);

    const {
      data: { meta, payload },
    } = response.data;
    const updatedPayload = payload.sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
    const allConversations = {
      meta,
      payload: updatedPayload,
    };

    dispatch({
      type: GET_CONVERSATION_SUCCESS,
      payload: allConversations,
    });
  } catch (error) {
    dispatch({ type: GET_CONVERSATION_ERROR, payload: error });
  }
};

// Set conversation status (Open or Resolved)
export const setConversationStatus = ({ status }) => async dispatch => {
  dispatch({ type: SET_CONVERSATION_STATUS, payload: status });
};

// Add new conversation to the conversation list
export const addConversation = ({ conversation }) => async dispatch => {
  dispatch({ type: ADD_CONVERSATION, payload: conversation });
};

// Add new message to a conversation
export const addMessageToConversation = ({ message }) => async (
  dispatch,
  getState,
) => {
  const {
    data: { payload },
  } = getState().conversation;

  dispatch({ type: UPDATE_MESSAGE, payload: message });

  const [chat] = payload.filter(c => c.id === message.conversation_id);

  if (!chat) {
    return;
  }
  const previousMessageIds = chat.messages.map(m => m.id);
  if (!previousMessageIds.includes(message.id)) {
    chat.messages.push(message);
  }

  const index = payload.findIndex(c => c.id === message.conversation_id);

  let updatedConversations = payload.map((content, i) =>
    i === index ? { ...content } : content,
  );

  updatedConversations.unshift(...updatedConversations.splice(index, 1));

  dispatch({ type: UPDATE_CONVERSATION, payload: updatedConversations });
};

// Load initial messages
export const loadInitialMessage = ({ messages }) => async dispatch => {
  try {
    dispatch({
      type: ADD_MESSAGE,
      payload: messages,
    });
  } catch (error) {
    dispatch({ type: GET_MESSAGES_ERROR, payload: error });
  }
};

export const loadMessage = ({ conversationId, beforeId }) => async dispatch => {
  dispatch({ type: GET_MESSAGES });
  try {
    const apiUrl = `${API}conversations/${conversationId}?before=${beforeId}`;

    const response = await axios.get(apiUrl);

    const { payload } = response.data;

    dispatch({
      type: GET_MESSAGES_SUCCESS,
      payload: payload,
    });
  } catch (error) {
    dispatch({ type: GET_MESSAGES_ERROR, payload: error });
  }
};

export const loadMoreMessage = ({
  conversationId,
  beforeId,
}) => async dispatch => {
  dispatch({ type: GET_MORE_MESSAGES });
  try {
    const apiUrl = `${API}conversations/${conversationId}?before=${beforeId}`;
    const response = await axios.get(apiUrl);
    const { payload } = response.data;
    if (payload.length) {
      dispatch({
        type: GET_MORE_MESSAGES_SUCCESS,
        payload: payload,
      });
    } else {
      dispatch({
        type: ALL_MESSAGES_LOADED,
      });
    }
  } catch (error) {
    dispatch({ type: GET_MORE_MESSAGES_ERROR, payload: error });
  }
};

// Send message
export const sendMessage = ({ conversationId, message }) => async dispatch => {
  dispatch({ type: SEND_MESSAGE });
  try {
    const apiUrl = `${API}conversations/${conversationId}/messages`;
    const response = await axios.post(apiUrl, message);

    const { payload } = response.data;
    dispatch({
      type: SEND_MESSAGE_SUCCESS,
      payload: payload,
    });
  } catch (error) {
    dispatch({ type: SEND_MESSAGE_ERROR, payload: error });
  }
};
