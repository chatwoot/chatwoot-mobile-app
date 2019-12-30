import {
  GET_AGENT,
  GET_AGENT_ERROR,
  GET_AGENT_SUCCESS,
  SET_AGENT,
} from '../constants/actions';

const initialState = {
  isFetching: false,
  data: [],
  agentSelected: {},
};
export default (state = initialState, action) => {
  switch (action.type) {
    case GET_AGENT: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case GET_AGENT_ERROR: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case GET_AGENT_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: action.payload,
      };
    }

    case SET_AGENT:
      return {
        ...state,
        agentSelected: action.payload,
      };

    default:
      return state;
  }
};
