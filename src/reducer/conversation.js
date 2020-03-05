import {
  GET_CONVERSATION,
  GET_CONVERSATION_ERROR,
  GET_CONVERSATION_SUCCESS,
  SET_CONVERSATION_STATUS,
  ADD_CONVERSATION,
  UPDATE_CONVERSATION,
  GET_MESSAGES,
  GET_MESSAGES_SUCCESS,
  GET_MESSAGES_ERROR,
  ADD_MESSAGE,
  UPDATE_MESSAGE,
  ALL_MESSAGES_LOADED,
  ALL_CONVERSATIONS_LOADED,
  SET_CONVERSATION,
  GET_CANNED_RESPONSES,
  GET_CANNED_RESPONSES_SUCCESS,
  GET_CANNED_RESPONSES_ERROR,
} from '../constants/actions';

const initialState = {
  isFetching: false,
  isAllConversationsLoaded: false,
  isAllMessagesLoaded: false,
  conversationStatus: 'Open',
  data: {
    meta: {
      mine_count: 0,
      unassigned_count: 0,
      all_count: 0,
    },
    payload: [],
  },
  allMessages: [],
  cannedResponses: [],
  selectedConversationId: null,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_CONVERSATION: {
      return {
        ...state,
        data: {
          meta: state.data.meta,
          payload: [action.payload, ...state.data.payload],
        },
      };
    }
    case UPDATE_CONVERSATION:
      return {
        ...state,
        data: {
          meta: state.data.meta,
          payload: action.payload,
        },
      };

    case SET_CONVERSATION_STATUS:
      return {
        ...state,
        conversationStatus: action.payload,
      };

    case SET_CONVERSATION:
      return {
        ...state,
        selectedConversationId: action.payload,
        allMessages: [],
      };

    case ADD_MESSAGE: {
      return {
        ...state,
        allMessages: action.payload,
        isAllMessagesLoaded: false,
      };
    }

    case GET_CONVERSATION: {
      return {
        ...state,
        isFetching: true,
        isAllConversationsLoaded: false,
        data: {
          meta: state.data.meta,
          payload: [],
        },
      };
    }

    case GET_CONVERSATION_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: {
          meta: action.payload.meta,
          payload: [...state.data.payload, ...action.payload.conversations],
        },
      };
    }

    case GET_CONVERSATION_ERROR: {
      return {
        ...initialState,
        isFetching: false,
      };
    }

    case GET_MESSAGES: {
      return {
        ...state,
        isFetching: true,
        isAllMessagesLoaded: false,
      };
    }

    case GET_MESSAGES_SUCCESS: {
      return {
        ...state,
        isFetching: true,
        allMessages: [...action.payload, ...state.allMessages],
      };
    }

    case GET_MESSAGES_ERROR: {
      return {
        ...initialState,
        isFetching: false,
      };
    }

    case ALL_MESSAGES_LOADED: {
      return {
        ...state,
        isAllMessagesLoaded: true,
      };
    }

    case ALL_CONVERSATIONS_LOADED: {
      return {
        ...state,
        isAllConversationsLoaded: true,
        isFetching: false,
      };
    }

    case UPDATE_MESSAGE: {
      return {
        ...state,
        isFetching: false,
        allMessages: [...state.allMessages, action.payload],
      };
    }

    case GET_CANNED_RESPONSES: {
      return {
        ...state,
        cannedResponses: [],
      };
    }

    case GET_CANNED_RESPONSES_SUCCESS: {
      return {
        ...state,
        cannedResponses: action.payload,
      };
    }

    case GET_CANNED_RESPONSES_ERROR: {
      return {
        ...state,
        cannedResponses: [],
      };
    }

    default:
      return state;
  }
};
