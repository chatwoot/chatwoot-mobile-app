import {
  GET_CONVERSATION,
  GET_CONVERSATION_ERROR,
  GET_CONVERSATION_SUCCESS,
  SET_CONVERSATION_STATUS,
  ADD_CONVERSATION,
  GET_MESSAGES,
  GET_MESSAGES_SUCCESS,
  GET_MESSAGES_ERROR,
  UPDATE_CONVERSATION,
  UPDATE_MESSAGE,
  ALL_MESSAGES_LOADED,
  ALL_CONVERSATIONS_LOADED,
  SEND_MESSAGE,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_ERROR,
  MARK_MESSAGES_AS_READ,
  MARK_MESSAGES_AS_READ_SUCCESS,
  MARK_MESSAGES_AS_READ_ERROR,
  SET_CONVERSATION,
  GET_CANNED_RESPONSES,
  GET_CANNED_RESPONSES_SUCCESS,
  GET_CANNED_RESPONSES_ERROR,
} from '../constants/actions';

import axios from '../helpers/APIHelper';

import { API } from '../constants/url';
import { ASSIGNEE_TYPE } from '../constants';

// Load all the conversations
export const getConversations = ({
  assigneeType,
  conversationStatus,
  inboxSelected,
  pageNumber = 1,
}) => async dispatch => {
  if (pageNumber === 1) {
    dispatch({ type: GET_CONVERSATION });
  }

  try {
    let assignee;
    switch (assigneeType) {
      case 0:
        assignee = ASSIGNEE_TYPE.ME;
        break;
      case 1:
        assignee = ASSIGNEE_TYPE.UN_ASSIGNED;
        break;
      default:
        assignee = ASSIGNEE_TYPE.ALL;
    }

    const status = conversationStatus === 'Open' ? 'open' : 'resolved';

    const inboxId = inboxSelected.id || null;

    const apiUrl = `${API}conversations`;
    const params = {
      inbox_id: inboxId,
      status,
      assignee_type: assignee,
      page: pageNumber,
    };

    const response = await axios.get(apiUrl, {
      params,
    });

    const {
      data: { meta, payload },
    } = response.data;
    const updatedPayload = payload.sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
    const allConversations = {
      meta,
      conversations: updatedPayload,
    };

    dispatch({
      type: GET_CONVERSATION_SUCCESS,
      payload: allConversations,
    });

    if (payload.length < 20) {
      dispatch({
        type: ALL_CONVERSATIONS_LOADED,
      });
    }
  } catch (error) {
    dispatch({ type: GET_CONVERSATION_ERROR, payload: error });
  }
};

// Set conversation status (Open or Resolved)
export const setConversationStatus = ({ status }) => async dispatch => {
  dispatch({ type: SET_CONVERSATION_STATUS, payload: status });
};

export const setConversation = ({ conversationId }) => async dispatch => {
  dispatch({ type: SET_CONVERSATION, payload: conversationId });
};

// Add new conversation to the conversation list
export const addConversation = ({ conversation }) => async (
  dispatch,
  getState,
) => {
  const {
    data: { payload },
  } = getState().conversation;

  // Check conversation is already exists or not
  const [conversationExists] = payload.filter(c => c.id === conversation.id);

  if (conversationExists) {
    return;
  }
  dispatch({ type: ADD_CONVERSATION, payload: conversation });
};

// Add new message to a conversation
export const addMessageToConversation = ({ message }) => async (
  dispatch,
  getState,
) => {
  const {
    data: { payload },
    selectedConversationId,
  } = getState().conversation;

  const { conversation_id } = message;
  if (selectedConversationId === conversation_id) {
    dispatch({ type: UPDATE_MESSAGE, payload: message });
  }

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

export const loadMessages = ({
  conversationId,
  beforeId,
}) => async dispatch => {
  dispatch({ type: GET_MESSAGES });

  try {
    const apiUrl = `${API}conversations/${conversationId}/messages`;

    const params = {
      before: beforeId,
    };

    const response = await axios.get(apiUrl, { params });

    const { payload } = response.data;

    dispatch({
      type: GET_MESSAGES_SUCCESS,
      payload: payload,
    });

    if (payload.length < 20) {
      dispatch({
        type: ALL_MESSAGES_LOADED,
      });
    }
  } catch (error) {
    dispatch({ type: GET_MESSAGES_ERROR, payload: error });
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

export const markMessagesAsRead = ({
  conversationId,
  message,
}) => async dispatch => {
  dispatch({ type: MARK_MESSAGES_AS_READ });
  try {
    const apiUrl = `${API}conversations/${conversationId}/update_last_seen`;
    const agent_last_seen_at = new Date().getTime();
    const response = await axios.post(apiUrl, {
      agent_last_seen_at,
    });

    dispatch({
      type: MARK_MESSAGES_AS_READ_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({ type: MARK_MESSAGES_AS_READ_ERROR, payload: error });
  }
};

export const loadCannedResponses = () => async dispatch => {
  dispatch({ type: GET_CANNED_RESPONSES });

  try {
    const apiUrl = `${API}canned_responses`;

    const response = await axios.get(apiUrl);

    const { data } = response;

    const payload = data.map(item => ({
      ...item,
      title: `${item.short_code} - ${item.content.substring(0, 40)}`,
    }));

    dispatch({
      type: GET_CANNED_RESPONSES_SUCCESS,
      payload,
    });
  } catch (error) {
    dispatch({ type: GET_CANNED_RESPONSES_ERROR, payload: error });
  }
};
