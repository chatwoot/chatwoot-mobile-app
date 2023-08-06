import {
  applyFilters,
  getUuid,
  findLastMessage,
  replaceMentionsWithUsernames,
  findUniqueMessages,
  getGroupedMessages,
  getTypingUsersText,
  extractConversationIdFromUrl,
} from 'helpers/conversationHelpers';

import { messages } from './fixtures/messages';

describe('conversation helpers', () => {
  it('should return true if conversation status matches filter status', () => {
    const conversation = {
      status: 'open',
    };
    const filters = {
      conversationStatus: 'open',
    };
    expect(applyFilters(conversation, filters)).toBe(true);
  });

  it('should return false if conversation status does not match filter status', () => {
    const conversation = {
      status: 'open',
    };
    const filters = {
      conversationStatus: 'resolved',
    };
    expect(applyFilters(conversation, filters)).toBe(false);
  });

  it('should return true if conversation status matches filter status and inbox id matches', () => {
    const conversation = {
      status: 'open',
      inbox_id: 1,
    };
    const filters = {
      conversationStatus: 'open',
      inboxId: 1,
    };
    expect(applyFilters(conversation, filters)).toBe(true);
  });

  it('should return false if conversation status matches filter status and inbox id does not match', () => {
    const conversation = {
      status: 'open',
      inbox_id: 1,
    };
    const filters = {
      conversationStatus: 'open',
      inboxId: 2,
    };
    expect(applyFilters(conversation, filters)).toBe(false);
  });

  it('should return true if conversation status does not match filter status and inbox id matches', () => {
    const conversation = {
      status: 'open',
      inbox_id: 1,
    };
    const filters = {
      conversationStatus: 'resolved',
      inboxId: 1,
    };
    expect(applyFilters(conversation, filters)).toBe(false);
  });

  it('should return false if conversation status does not match filter status and inbox id does not match', () => {
    const conversation = {
      status: 'open',
      inbox_id: 1,
    };
    const filters = {
      conversationStatus: 'resolved',
      inboxId: 2,
    };
    expect(applyFilters(conversation, filters)).toBe(false);
  });
  it('return uuid', () => {
    expect(getUuid()).toBeDefined();
  });
});

describe('#lastMessage', () => {
  it("should return last activity message if both api and store doesn't have other messages", () => {
    const conversation = {
      messages: [{ id: 1, created_at: 1654333, message_type: 2, content: 'Hey' }],
      last_non_activity_message: null,
    };
    const { messages: allMessages } = conversation;
    expect(findLastMessage(conversation)).toEqual(allMessages[allMessages.length - 1]);
  });

  it('should return message from store if store has latest message', () => {
    const conversation = {
      messages: [],
      last_non_activity_message: {
        id: 2,
        created_at: 1654334,
        message_type: 2,
        content: 'Hey',
      },
    };
    expect(findLastMessage(conversation)).toEqual(conversation.last_non_activity_message);
  });

  it('should return last non activity message from store if api value is empty', () => {
    const conversation = {
      messages: [
        {
          id: 1,
          created_at: 1654333,
          message_type: 1,
          content: 'Outgoing Message',
        },
        { id: 2, created_at: 1654334, message_type: 2, content: 'Hey' },
      ],
      last_non_activity_message: null,
    };
    expect(findLastMessage(conversation)).toEqual(conversation.messages[0]);
  });

  it("should return last non activity message from store if store doesn't have any messages", () => {
    const conversation = {
      messages: [
        {
          id: 1,
          created_at: 1654333,
          message_type: 1,
          content: 'Outgoing Message',
        },
        {
          id: 3,
          created_at: 1654335,
          message_type: 0,
          content: 'Incoming Message',
        },
      ],
      last_non_activity_message: {
        id: 2,
        created_at: 1654334,
        message_type: 2,
        content: 'Hey',
      },
    };
    expect(findLastMessage(conversation)).toEqual(conversation.messages[1]);
  });
});

describe('#replaceMentionsWithUsernames', () => {
  it('should replace mentions with user name', () => {
    const message = '[@Peter Don](mention://user/3994/Peter) Are you able to view this content?';
    expect(replaceMentionsWithUsernames(message)).toEqual(
      '@Peter Don Are you able to view this content?',
    );
  });

  it('should replace mentions with user name have first name and last name', () => {
    const message = '[@Jane Per](mention://user/21/%241) Are you able to view this content?';
    expect(replaceMentionsWithUsernames(message)).toEqual(
      '@Jane Per Are you able to view this content?',
    );
  });

  it('should replace mentions with user name have only first name', () => {
    const message = '[@Jane](mention://user/21/Jane) Are you able to view this content?';
    expect(replaceMentionsWithUsernames(message)).toEqual(
      '@Jane Are you able to view this content?',
    );
  });
});

describe('findUniqueMessages', () => {
  it('should return unique messages', () => {
    const uniqueMessages = findUniqueMessages({ allMessages: messages });
    expect(uniqueMessages[uniqueMessages.length - 1].content).toEqual('Hey;) how may I help you?');
    expect(uniqueMessages.length).toEqual(4);
  });

  it('should return empty array if there are no messages', () => {
    const uniqueMessages = findUniqueMessages({ allMessages: [] });
    expect(uniqueMessages.length).toEqual(0);
  });

  it('should return non-duplicate messages', () => {
    const uniqueMessages = findUniqueMessages({
      allMessages: [
        {
          id: 58660,
          content: 'Conversation was marked resolved by John Doe',
          inbox_id: 401,
          conversation_id: 2684,
          message_type: 2,
          content_type: 'text',
          status: 'sent',
          content_attributes: {},
          created_at: 1690947987,
          private: false,
          source_id: null,
        },
        ...messages,
      ],
    });
    expect(uniqueMessages.length).toEqual(4);
  });

  it('should return messages in sorted order', () => {
    const uniqueMessages = findUniqueMessages({
      allMessages: [
        ...messages,
        {
          id: 58660,
          content: 'Conversation was marked resolved by John Doe',
          inbox_id: 401,
          conversation_id: 2684,
          message_type: 2,
          content_type: 'text',
          status: 'sent',
          content_attributes: {},
          created_at: 1690947987,
          private: false,
          source_id: null,
        },
      ],
    });
    expect(uniqueMessages[uniqueMessages.length - 1].content).toEqual('Hey;) how may I help you?');
  });
});

describe('getGroupedMessages', () => {
  it('should return grouped messages', () => {
    const groupedMessages = getGroupedMessages({ messages });

    expect(groupedMessages).toEqual([
      {
        data: [
          {
            showAvatar: true,
            id: 58626,
            content: 'Hey;) how may I help you?',
            inbox_id: 401,
            conversation_id: 2684,
            message_type: 2,
            content_type: 'text',
            status: 'sent',
            content_attributes: {},
            created_at: 1689835763,
            private: false,
            source_id: null,
          },

          {
            showAvatar: false,
            id: 58627,
            content: 'Sure, I will check and get back to you',
            inbox_id: 401,
            conversation_id: 2684,
            message_type: 1,
            content_type: 'text',
            status: 'sent',
            content_attributes: {},
            created_at: 1689835783,
            private: true,
            source_id: null,
            sender: {
              id: 8,
              name: 'John Doe',
              available_name: 'John Doe',
            },
          },
          {
            showAvatar: true,
            id: 58628,
            content: 'What I can do for you?',
            inbox_id: 401,
            conversation_id: 2684,
            message_type: 1,
            content_type: 'text',
            status: 'sent',
            content_attributes: {},
            created_at: 1689839530,
            private: false,
            source_id: null,
            sender: {
              id: 8,
              name: 'John Doe',
              available_name: 'John Doe',
            },
          },
        ],
        date: 'Jul 20, 2023',
      },
      {
        data: [
          {
            showAvatar: true,
            id: 58660,
            content: 'Conversation was marked resolved by John Doe',
            inbox_id: 401,
            conversation_id: 2684,
            message_type: 2,
            content_type: 'text',
            status: 'sent',
            content_attributes: {},
            created_at: 1690034520,
            private: false,
            source_id: null,
          },
        ],
        date: 'Jul 22, 2023',
      },
    ]);
  });
});

describe('#getTypingUsersText', () => {
  const conversationId = 1;
  it('returns the correct text is there is only one typing user', () => {
    expect(
      getTypingUsersText({
        conversationId,
        conversationTypingUsers: {
          1: [
            {
              name: 'John',
            },
          ],
        },
      }),
    ).toEqual('John is typing...');
  });

  it('returns the correct text is there are two typing users', () => {
    expect(
      getTypingUsersText({
        conversationId,
        conversationTypingUsers: { 1: [{ name: 'John' }, { name: 'Peter' }] },
      }),
    ).toEqual('John and Peter are typing...');
  });

  it('returns the correct text is there are more than two users are typing', () => {
    expect(
      getTypingUsersText({
        conversationId,
        conversationTypingUsers: {
          1: [{ name: 'John' }, { name: 'Peter' }, { name: 'Jane' }, { name: 'Doe' }],
        },
      }),
    ).toEqual('John and 3 others are typing...');
  });
});

describe('extractConversationIdFromUrl', () => {
  it('should return conversation if valid url is passed', () => {
    expect(
      extractConversationIdFromUrl({
        url: 'https://app.chatwoot.com/app/accounts/1/conversations/23919',
      }),
    ).toBe(23919);
  });

  it('should return conversation if folder conversation url is passed', () => {
    expect(
      extractConversationIdFromUrl({
        url: 'https://app.chatwoot.com/app/accounts/1/custom_view/338/conversations/26511',
      }),
    ).toBe(26511);
  });

  it('should return conversation if mention conversation url is passed', () => {
    expect(
      extractConversationIdFromUrl({
        url: 'https://app.chatwoot.com/app/accounts/1/mentions/conversations/21480',
      }),
    ).toBe(21480);
  });

  it('should return null if invalid url is passed', () => {
    expect(
      extractConversationIdFromUrl({
        url: 'https://app.chatwoot.com/app/accounts/1/conversations/',
      }),
    ).toBe(null);
  });

  it('should return null if null url is passed', () => {
    expect(
      extractConversationIdFromUrl({
        url: null,
      }),
    ).toBe(null);
  });
});
