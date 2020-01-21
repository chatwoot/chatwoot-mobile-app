import {
  GET_CONVERSATION,
  GET_CONVERSATION_ERROR,
  GET_CONVERSATION_SUCCESS,
  SET_CONVERSATION_STATUS,
  ADD_CONVERSATION,
  ADD_MESSAGE,
} from '../constants/actions';

import axios from '../helpers/APIHelper';

import { API } from '../constants/url';

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

export const setConversationStatus = ({ status }) => async dispatch => {
  dispatch({ type: SET_CONVERSATION_STATUS, payload: status });
};

export const addConversation = ({ conversation }) => async dispatch => {
  dispatch({ type: ADD_CONVERSATION, payload: conversation });
};

export const addMessage = ({ message }) => async (dispatch, getState) => {
  const {
    data: { payload },
  } = getState().conversation;

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

  dispatch({ type: ADD_MESSAGE, payload: updatedConversations });
};
