import {
  GET_INBOX,
  GET_INBOX_AGENTS,
  GET_INBOX_AGENTS_ERROR,
  GET_INBOX_AGENTS_SUCCESS,
  GET_INBOX_ERROR,
  GET_INBOX_SUCCESS,
  SET_INBOX,
} from '../constants/actions';

const initialState = {
  isFetching: false,
  data: [],
  inboxSelected: {},
  inboxAgents: {},
  isInboxAgentsFetching: false,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case GET_INBOX: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case GET_INBOX_ERROR: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case GET_INBOX_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: action.payload,
      };
    }

    case SET_INBOX:
      return {
        ...state,
        inboxSelected: action.payload,
      };

    case GET_INBOX_AGENTS: {
      return {
        ...state,
        isInboxAgentsFetching: true,
      };
    }

    case GET_INBOX_AGENTS_SUCCESS: {
      return {
        ...state,
        isInboxAgentsFetching: false,
        inboxAgents: action.payload,
      };
    }
    case GET_INBOX_AGENTS_ERROR: {
      return {
        ...state,
        isInboxAgentsFetching: false,
      };
    }
    default:
      return state;
  }
};
