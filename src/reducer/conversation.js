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
} from '../constants/actions';

const initialState = {
  isFetching: false,
  conversationStatus: 'Open',
  data: [],
  allMessages: [],
};
export default (state = initialState, action) => {
  switch (action.type) {
    case GET_CONVERSATION: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case GET_CONVERSATION_ERROR: {
      return {
        ...initialState,
        isFetching: false,
      };
    }

    case GET_CONVERSATION_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: action.payload,
      };
    }
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

    case GET_MESSAGES: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case GET_MESSAGES_ERROR: {
      return {
        ...initialState,
        isFetching: false,
      };
    }

    case GET_MESSAGES_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        allMessages: [...action.payload, ...state.allMessages],
      };
    }

    case ADD_MESSAGE: {
      return {
        ...state,
        isFetching: false,
        allMessages: action.payload,
      };
    }
    case UPDATE_MESSAGE: {
      return {
        ...state,
        isFetching: false,
        allMessages: [...state.allMessages, action.payload],
      };
    }

    default:
      return state;
  }
};
