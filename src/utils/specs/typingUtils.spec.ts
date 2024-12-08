import { getTypingUsersText } from '@/utils/typingUtils';

describe('#getTypingUsersText', () => {
  it('returns the correct text is there is only one typing user', () => {
    expect(
      getTypingUsersText({
        users: [
          {
            name: 'John',
            type: 'user',
            email: 'john@example.com',
            id: 1,
            phoneNumber: '1234567890',
            thumbnail: 'https://example.com/thumbnail.jpg',
          },
        ],
      }),
    ).toEqual('John is typing');
  });

  it('returns the correct text is there are two typing users', () => {
    expect(
      getTypingUsersText({
        users: [
          {
            name: 'John',
            type: 'user',
            email: 'john@example.com',
            id: 1,
            phoneNumber: '1234567890',
            thumbnail: 'https://example.com/thumbnail.jpg',
          },
          {
            name: 'Peter',
            type: 'user',
            email: 'peter@example.com',
            id: 2,
            phoneNumber: '1234567890',
            thumbnail: 'https://example.com/thumbnail.jpg',
          },
        ],
      }),
    ).toEqual('John and Peter are typing');
  });
  it('returns the correct text is there are more than two users are typing', () => {
    expect(
      getTypingUsersText({
        users: [
          {
            name: 'John',
            type: 'user',
            email: 'john@example.com',
            id: 1,
            phoneNumber: '1234567890',
            thumbnail: 'https://example.com/thumbnail.jpg',
          },
          {
            name: 'Peter',
            type: 'user',
            email: 'peter@example.com',
            id: 2,
            phoneNumber: '1234567890',
            thumbnail: 'https://example.com/thumbnail.jpg',
          },
          {
            name: 'Jane',
            type: 'user',
            email: 'jane@example.com',
            id: 3,
            phoneNumber: '1234567890',
            thumbnail: 'https://example.com/thumbnail.jpg',
          },
          {
            name: 'Doe',
            type: 'user',
            email: 'doe@example.com',
            id: 4,
            phoneNumber: '1234567890',
            thumbnail: 'https://example.com/thumbnail.jpg',
          },
        ],
      }),
    ).toEqual('John and 3 others are typing');
  });
});
