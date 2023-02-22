import conversationTypingSlice, {
  selectAllTypingUsers,
  addUserToTyping,
  destroyUserFromTyping,
} from '../conversationTypingSlice';

describe('conversationTypingSlice', () => {
  describe('reducers', () => {
    const initialState = { entities: {}, ids: [], loading: false, records: {} };

    it('Add typing users to store', () => {
      expect(
        conversationTypingSlice(
          initialState,
          addUserToTyping({ conversationId: 1, user: { id: 1, type: 'user' } }),
        ),
      ).toEqual({
        entities: {},
        ids: [],
        loading: false,
        records: {
          1: [{ id: 1, type: 'user' }],
        },
      });
    });

    it('Remove typing users from store', () => {
      expect(
        conversationTypingSlice(
          { entities: {}, ids: [], loading: false, records: { 1: [{ id: 1, type: 'user' }] } },
          destroyUserFromTyping({ conversationId: 1, user: { id: 1, type: 'user' } }),
        ),
      ).toEqual({
        entities: {},
        ids: [],
        loading: false,
        records: {
          1: [],
        },
      });
    });
  });

  describe('selectors', () => {
    it('selects all typing users', () => {
      const state = {
        conversationTypingStatus: {
          entities: {},
          ids: [],
          loading: false,
          records: {
            1: [{ id: 1, type: 'user' }],
          },
        },
      };
      expect(selectAllTypingUsers(state)).toEqual({
        1: [{ id: 1, type: 'user' }],
      });
    });
  });
});
