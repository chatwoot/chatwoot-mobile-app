import {
  GET_AGENT,
  GET_AGENT_ERROR,
  GET_AGENT_SUCCESS,
} from '../constants/actions';

const initialState = {
  isFetching: false,
  data: [],
};
export default (state = initialState, action) => {
  switch (action.type) {
    case GET_AGENT: {
      return {
        ...initialState,
        isFetching: true,
      };
    }

    case GET_AGENT_ERROR: {
      return {
        ...initialState,
        isFetching: false,
      };
    }

    case GET_AGENT_SUCCESS: {
      return {
        isFetching: false,
        data: action.payload,
      };
    }
    default:
      return state;
  }
};
