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
  CHANGING_CONVERSATION_STATUS,
  CHANGED_CONVERSATION_STATUS,
  SET_CONVERSATION,
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
  GET_ALL_LABELS,
  GET_ALL_LABELS_SUCCESS,
  GET_ALL_LABELS_ERROR,
  GET_CONVERSATION_LABELS,
  UPDATE_CONVERSATION_LABELS_SUCCESS,
  GET_CONVERSATION_LABELS_SUCCESS,
  GET_CONVERSATION_LABELS_ERROR,
  GET_ALL_TEAMS,
  GET_ALL_TEAMS_SUCCESS,
  GET_ALL_TEAMS_ERROR,
  ASSIGN_TEAM,
  ASSIGN_TEAM_SUCCESS,
  ASSIGN_TEAM_ERROR,
  GET_ALL_CUSTOM_ATTRIBUTES,
  GET_ALL_CUSTOM_ATTRIBUTES_SUCCESS,
  GET_ALL_CUSTOM_ATTRIBUTES_ERROR,
} from '../constants/actions';

const initialState = {
  isFetching: false,
  isAllConversationsLoaded: false,
  isAllMessagesLoaded: false,
  isChangingConversationStatus: false,
  conversationStatus: 'open',
  isAssigneeUpdating: false,
  isAllLabelsLoaded: false,
  isConversationLabelsLoaded: false,
  isAllAvailableTeamsLoaded: false,
  isTeamUpdating: false,
  data: {
    meta: {
      mine_count: 0,
      unassigned_count: 0,
      all_count: 0,
    },
    payload: [],
  },
  allMessages: [],
  conversationDetails: null,
  selectedConversationId: null,
  conversationTypingUsers: {},
  activeUsers: {},
  assigneeType: 0,
  availableLabels: [],
  conversationLabels: [],
  availableTeams: [],
  customAttributes: [],
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

    case CHANGING_CONVERSATION_STATUS: {
      return {
        ...state,
        isChangingConversationStatus: true,
      };
    }

    case CHANGED_CONVERSATION_STATUS: {
      return {
        ...state,
        isChangingConversationStatus: false,
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

    case GET_ALL_LABELS: {
      return {
        ...state,
        availableLabels: [],
        isAllLabelsLoaded: true,
      };
    }

    case GET_ALL_LABELS_SUCCESS: {
      return {
        ...state,
        availableLabels: action.payload,
        isAllLabelsLoaded: false,
      };
    }

    case GET_ALL_LABELS_ERROR: {
      return {
        ...state,
        availableLabels: [],
        isAllLabelsLoaded: false,
      };
    }

    case GET_CONVERSATION_LABELS: {
      return {
        ...state,
        conversationLabels: [],
        isConversationLabelsLoaded: true,
      };
    }

    case GET_CONVERSATION_LABELS_SUCCESS: {
      return {
        ...state,
        conversationLabels: action.payload,
        isConversationLabelsLoaded: false,
      };
    }

    case UPDATE_CONVERSATION_LABELS_SUCCESS: {
      return {
        ...state,
        conversationLabels: action.payload,
      };
    }

    case GET_CONVERSATION_LABELS_ERROR: {
      return {
        ...state,
        conversationLabels: [],
        isConversationLabelsLoaded: false,
      };
    }

    case GET_ALL_TEAMS: {
      return {
        ...state,
        availableTeams: [],
        isAllAvailableTeamsLoaded: true,
      };
    }

    case GET_ALL_TEAMS_SUCCESS: {
      return {
        ...state,
        availableTeams: action.payload,
        isAllAvailableTeamsLoaded: false,
      };
    }

    case GET_ALL_TEAMS_ERROR: {
      return {
        ...state,
        availableTeams: [],
        isAllAvailableTeamsLoaded: false,
      };
    }

    case ASSIGN_TEAM: {
      return {
        ...state,
        isTeamUpdating: true,
      };
    }

    case ASSIGN_TEAM_SUCCESS: {
      return {
        ...state,
        isTeamUpdating: false,
      };
    }

    case ASSIGN_TEAM_ERROR: {
      return {
        ...state,
        isTeamUpdating: false,
      };
    }

    case GET_ALL_CUSTOM_ATTRIBUTES: {
      return {
        ...state,
        customAttributes: [],
      };
    }

    case GET_ALL_CUSTOM_ATTRIBUTES_SUCCESS: {
      return {
        ...state,
        customAttributes: action.payload,
      };
    }

    case GET_ALL_CUSTOM_ATTRIBUTES_ERROR: {
      return {
        ...state,
        customAttributes: [],
      };
    }

    default:
      return state;
  }
};
