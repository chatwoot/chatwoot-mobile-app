import {
  GET_CONVERSATION,
  GET_CONVERSATION_ERROR,
  GET_CONVERSATION_SUCCESS,
  SET_CONVERSATION_STATUS,
} from '../constants/actions';

const initialState = {
  isFetching: false,
  conversationStatus: 'Open',
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
    case SET_CONVERSATION_STATUS:
      return {
        ...state,
        conversationStatus: action.payload,
      };
    default:
      return state;
  }
};
