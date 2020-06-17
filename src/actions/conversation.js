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
  SET_CONVERSATION_DETAILS,
  RESET_CONVERSATION,
  ADD_OR_UPDATE_USER_TYPING_IN_CONVERSATION,
  RESET_USER_TYPING_CONVERSATION,
  ADD_MESSAGE,
} from '../constants/actions';

import axios from '../helpers/APIHelper';

import { getAllNotifications } from './notification';
import { ASSIGNEE_TYPE } from '../constants';

// Load all the conversations
export const getConversations = ({
  assigneeType,
  conversationStatus,
  inboxSelected,
  pageNumber = 1,
}) => async (dispatch) => {
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

    const params = {
      inbox_id: inboxId,
      status,
      assignee_type: assignee,
      page: pageNumber,
    };

    const response = await axios.get('conversations', {
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
export const setConversationStatus = ({ status }) => async (dispatch) => {
  dispatch({ type: SET_CONVERSATION_STATUS, payload: status });
};

export const setConversation = ({ conversationId }) => async (dispatch) => {
  dispatch({ type: SET_CONVERSATION, payload: conversationId });
};

// Add or update new conversation to the conversation list
export const addOrUpdateConversation = ({ conversation }) => async (dispatch, getState) => {
  const {
    data: { payload },
  } = getState().conversation;

  // Check conversation is already exists or not
  const [conversationExists] = payload.filter((c) => c.id === conversation.id);

  if (conversationExists) {
    return;
  }

  dispatch({ type: ADD_CONVERSATION, payload: conversation });
  dispatch(getAllNotifications({ pageNo: 1 }));
};

// Add new message to a conversation
export const addMessageToConversation = ({ message }) => async (dispatch, getState) => {
  const {
    data: { payload },
    selectedConversationId,
    allMessages,
  } = getState().conversation;

  const { conversation_id, id: messageId } = message;
  const isMessageAlreadyExist = allMessages.find((item) => item.id === messageId);

  if (selectedConversationId === conversation_id && !isMessageAlreadyExist) {
    dispatch({ type: UPDATE_MESSAGE, payload: message });
  }
  // Check conversation exist or not in conversation state
  const [chat] = payload.filter((c) => c.id === message.conversation_id);

  if (!chat) {
    // Add conversation if it is not exist conversation state
    const apiUrl = `conversations/${conversation_id}`;
    const response = await axios.get(apiUrl);
    const conversation = response.data;
    dispatch(addOrUpdateConversation({ conversation }));
    return;
  }
  const previousMessageIds = chat.messages.map((m) => m.id);
  if (!previousMessageIds.includes(message.id)) {
    chat.messages.push(message);
  }

  const index = payload.findIndex((c) => c.id === message.conversation_id);

  let updatedConversations = payload.map((content, i) => (i === index ? { ...content } : content));

  updatedConversations.unshift(...updatedConversations.splice(index, 1));

  dispatch({ type: UPDATE_CONVERSATION, payload: updatedConversations });
};

export const loadMessages = ({ conversationId, beforeId }) => async (dispatch) => {
  dispatch({ type: GET_MESSAGES });

  try {
    const apiUrl = `conversations/${conversationId}/messages`;

    const params = {
      before: beforeId,
    };

    const response = await axios.get(apiUrl, { params });

    const { payload, meta } = response.data;

    dispatch({
      type: SET_CONVERSATION_DETAILS,
      payload: meta,
    });

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
export const sendMessage = ({ conversationId, message }) => async (dispatch) => {
  dispatch({ type: SEND_MESSAGE });
  try {
    const apiUrl = `conversations/${conversationId}/messages`;
    const response = await axios.post(apiUrl, message);

    dispatch({
      type: SEND_MESSAGE_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({ type: SEND_MESSAGE_ERROR, payload: error });
  }
};

export const markMessagesAsRead = ({ conversationId }) => async (dispatch, getState) => {
  const {
    data: { payload },
  } = getState().conversation;

  dispatch({ type: MARK_MESSAGES_AS_READ });
  try {
    const apiUrl = `conversations/${conversationId}/update_last_seen`;
    const agent_last_seen_at = new Date().getTime();
    const response = await axios.post(apiUrl, {
      agent_last_seen_at,
    });

    dispatch({
      type: MARK_MESSAGES_AS_READ_SUCCESS,
      payload: response.data,
    });

    const updatedConversations = payload.map((item) =>
      item.id === conversationId ? { ...item, agent_last_seen_at } : item,
    );

    dispatch({ type: UPDATE_CONVERSATION, payload: updatedConversations });
  } catch (error) {
    dispatch({ type: MARK_MESSAGES_AS_READ_ERROR, payload: error });
  }
};
export const loadCannedResponses = () => async (dispatch) => {
  dispatch({ type: GET_CANNED_RESPONSES });

  try {
    const response = await axios.get('canned_responses');

    const { data } = response;

    const payload = data.map((item) => ({
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

export const resetConversation = () => async (dispatch) => {
  dispatch({ type: RESET_CONVERSATION });
};

export const resetTypingToConversation = () => async (dispatch) => {
  dispatch({
    type: RESET_USER_TYPING_CONVERSATION,
  });
};

export const addUserTypingToConversation = ({ conversation, user }) => async (
  dispatch,
  getState,
) => {
  const { id: conversationId } = conversation;
  const { conversationTypingUsers } = await getState().conversation;
  const records = conversationTypingUsers[conversationId] || [];
  const hasUserRecordAlready = !!records.filter(
    (record) => record.id === user.id && record.type === user.type,
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

export const removeUserFromTypingConversation = ({ conversation, user }) => async (
  dispatch,
  getState,
) => {
  const { id: conversationId } = conversation;
  const { conversationTypingUsers } = await getState().conversation;
  const records = conversationTypingUsers[conversationId] || [];
  const updatedUsers = records.filter(
    (record) => record.id !== user.id || record.type !== user.type,
  );

  dispatch({
    type: ADD_OR_UPDATE_USER_TYPING_IN_CONVERSATION,
    payload: {
      conversationId,
      users: updatedUsers,
    },
  });
};

export const toggleTypingStatus = ({ conversationId, typingStatus }) => async (dispatch) => {
  const apiUrl = `conversations/${conversationId}/toggle_typing_status`;

  await axios
    .post(apiUrl, {
      typing_status: typingStatus,
    })
    .catch();
};

// Load initial messages [While opening chat screen from conversation list]
export const loadInitialMessage = ({ messages }) => async (dispatch) => {
  try {
    dispatch({
      type: ADD_MESSAGE,
      payload: messages,
    });
  } catch (error) {
    dispatch({ type: GET_MESSAGES_ERROR, payload: error });
  }
};
