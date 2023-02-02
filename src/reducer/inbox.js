import { GET_INBOX, GET_INBOX_ERROR, GET_INBOX_SUCCESS } from '../constants/actions';

const initialState = {
  isFetching: false,
  data: [],
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

    default:
      return state;
  }
};
