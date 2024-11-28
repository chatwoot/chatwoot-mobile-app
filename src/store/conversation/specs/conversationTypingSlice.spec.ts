import { RootState } from '@/store';
import reducer, {
  setTypingUsers,
  removeTypingUser,
  selectTypingUsers,
  selectTypingUsersByConversationId,
} from '../conversationTypingSlice';
import { TypingUser } from '@/types';

describe('conversationTyping reducer', () => {
  const initialState = {
    records: [],
  };

  const mockTypingUser: TypingUser = {
    id: 1,
    type: 'user',
    email: 'test@test.com',
    name: 'Test User',
    phoneNumber: '+1234567890',
    thumbnail: 'https://example.com/avatar.png',
  };

  const mockTypingUser2: TypingUser = {
    id: 2,
    type: 'user',
    email: 'test2@test.com',
    name: 'Test User 2',
    phoneNumber: '+1234567891',
    thumbnail: 'https://example.com/avatar2.png',
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setTypingUsers', () => {
    it('should add typing user when conversation has no typing users', () => {
      const actual = reducer(
        initialState,
        setTypingUsers({ conversationId: 1, user: mockTypingUser }),
      );
      expect(actual.records[1]).toEqual([mockTypingUser]);
    });

    it('should add typing user to existing conversation typing users', () => {
      const stateWithTypingUser = {
        records: {
          1: [mockTypingUser],
        },
      };
      const actual = reducer(
        stateWithTypingUser,
        setTypingUsers({ conversationId: 1, user: mockTypingUser2 }),
      );
      expect(actual.records[1]).toEqual([mockTypingUser, mockTypingUser2]);
    });

    it('should not add duplicate typing user', () => {
      const stateWithTypingUser = {
        records: {
          1: [mockTypingUser],
        },
      };
      const actual = reducer(
        stateWithTypingUser,
        setTypingUsers({ conversationId: 1, user: mockTypingUser }),
      );
      expect(actual.records[1]).toEqual([mockTypingUser]);
    });
  });

  describe('removeTypingUser', () => {
    it('should remove typing user from conversation', () => {
      const stateWithTypingUsers = {
        records: {
          1: [mockTypingUser, mockTypingUser2],
        },
      };
      const actual = reducer(
        stateWithTypingUsers,
        removeTypingUser({ conversationId: 1, user: mockTypingUser }),
      );
      expect(actual.records[1]).toEqual([mockTypingUser2]);
    });

    it('should handle removing user when user type is different', () => {
      const stateWithTypingUsers = {
        records: {
          1: [mockTypingUser],
        },
      };
      const differentTypeUser = { ...mockTypingUser, type: 'contact' as const };
      const actual = reducer(
        stateWithTypingUsers,
        removeTypingUser({ conversationId: 1, user: differentTypeUser }),
      );
      expect(actual.records[1]).toEqual([mockTypingUser]);
    });
  });

  describe('selectors', () => {
    const mockState = {
      conversationTyping: {
        records: {
          1: [mockTypingUser],
          2: [mockTypingUser2],
        },
      },
    } as Partial<RootState> as RootState;

    it('selectTypingUsers should return all typing records', () => {
      const selected = selectTypingUsers(mockState);
      expect(selected).toEqual(mockState.conversationTyping.records);
    });

    it('selectTypingUsersByConversationId should return typing users for specific conversation', () => {
      const selector = selectTypingUsersByConversationId(1);
      const selected = selector(mockState);
      expect(selected).toEqual([mockTypingUser]);
    });

    it('selectTypingUsersByConversationId should return empty array for non-existent conversation', () => {
      const selector = selectTypingUsersByConversationId(999);
      const selected = selector(mockState);
      expect(selected).toEqual([]);
    });
  });
});
