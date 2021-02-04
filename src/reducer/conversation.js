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
  SET_CONVERSATION_DETAILS,
  RESET_CONVERSATION,
  ADD_OR_UPDATE_USER_TYPING_IN_CONVERSATION,
  RESET_USER_TYPING_CONVERSATION,
  SET_ASSIGNEE_TYPE,
  SET_CONVERSATION_META,
  UPDATE_SINGLE_CONVERSATION,
  ASSIGN_CONVERSATION,
  ASSIGN_CONVERSATION_SUCCESS,
  ASSIGN_CONVERSATION_ERROR,
} from '../constants/actions';

const initialState = {
  isFetching: false,
  isAllConversationsLoaded: false,
  isAllMessagesLoaded: false,
  conversationStatus: 'open',
  isAssigneeUpdating: false,
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
  conversationDetails: null,
  selectedConversationId: null,
  conversationTypingUsers: {},
  activeUsers: {},
  assigneeType: 0,
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

    case SET_ASSIGNEE_TYPE:
      return {
        ...state,
        assigneeType: action.payload,
      };

    case SET_CONVERSATION:
      return {
        ...state,
        selectedConversationId: action.payload,
        allMessages: [],
        conversationDetails: null,
      };

    case SET_CONVERSATION_DETAILS:
      return {
        ...state,
        conversationDetails: action.payload,
      };

    case ADD_MESSAGE: {
      return {
        ...state,
        allMessages: action.payload,
        isAllMessagesLoaded: false,
      };
    }

    case SET_CONVERSATION_META: {
      return {
        ...state,
        data: {
          payload: state.data.payload,
          meta: action.payload,
        },
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

    case RESET_CONVERSATION: {
      return {
        ...state,
        allMessages: [],
        conversationDetails: null,
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

    case RESET_USER_TYPING_CONVERSATION: {
      return {
        ...state,
        conversationTypingUsers: {},
      };
    }
    case ADD_OR_UPDATE_USER_TYPING_IN_CONVERSATION: {
      return {
        ...state,
        conversationTypingUsers: {
          ...state.conversationTypingUsers,
          [action.payload.conversationId]: action.payload.users,
        },
      };
    }
    case UPDATE_SINGLE_CONVERSATION: {
      return {
        ...state,
        data: {
          meta: state.data.meta,
          payload: state.data.payload.map((content, i) =>
            action.payload.id === content.id ? { ...action.payload } : content,
          ),
        },
      };
    }
    case ASSIGN_CONVERSATION: {
      return {
        ...state,
        isAssigneeUpdating: true,
      };
    }

    case ASSIGN_CONVERSATION_SUCCESS: {
      return {
        ...state,
        isAssigneeUpdating: false,
      };
    }

    case ASSIGN_CONVERSATION_ERROR: {
      return {
        ...state,
        isAssigneeUpdating: false,
      };
    }

    default:
      return state;
  }
};
