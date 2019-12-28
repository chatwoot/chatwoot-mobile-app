import {
  GET_CONVERSATION,
  GET_CONVERSATION_ERROR,
  GET_CONVERSATION_SUCCESS,
} from '../constants/actions';

const initialState = {
  isFetching: false,
  data: [],
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
        ...state,
        isFetching: false,
      };
    }

    case GET_CONVERSATION_SUCCESS: {
      return {
        isFetching: false,
        data: action.payload,
      };
    }
    default:
      return state;
  }
};
