import reducer, { initialState } from '../agent';
import { GET_AGENTS, GET_AGENTS_SUCCESS, GET_AGENTS_ERROR } from '../../constants/actions';

describe('Agent reducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual({ isFetching: false, data: [], inboxSelected: {} });
  });

  it('update agent fetching', () => {
    expect(
      reducer(initialState, {
        type: GET_AGENTS,
      }),
    ).toEqual({
      isFetching: true,
      data: [],
      inboxSelected: {},
    });
  });
  it('update agent payload', () => {
    expect(
      reducer(initialState, {
        type: GET_AGENTS_SUCCESS,
        payload: [
          {
            account_id: 47,
            availability_status: 'online',
            available_name: 'John',
            confirmed: true,
            email: 'John@chatwoot.com',
            id: 21,
            name: 'John K',
            role: 'administrator',
          },
        ],
      }),
    ).toEqual({
      isFetching: false,
      data: [
        {
          account_id: 47,
          availability_status: 'online',
          available_name: 'John',
          confirmed: true,
          email: 'John@chatwoot.com',
          id: 21,
          name: 'John K',
          role: 'administrator',
        },
      ],
      inboxSelected: {},
    });
  });
  it('update fetching if any error', () => {
    expect(
      reducer(initialState, {
        type: GET_AGENTS_ERROR,
      }),
    ).toEqual({
      isFetching: false,
      data: [],
      inboxSelected: {},
    });
  });
});
