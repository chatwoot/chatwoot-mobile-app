import { GET_AGENTS, GET_AGENTS_ERROR, GET_AGENTS_SUCCESS } from '../constants/actions';

const initialState = {
  isFetching: false,
  data: [],
  inboxSelected: {},
};
export default (state = initialState, action) => {
  switch (action.type) {
    case GET_AGENTS: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case GET_AGENTS_ERROR: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case GET_AGENTS_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: action.payload,
      };
    }

    default:
      return state;
  }
};
