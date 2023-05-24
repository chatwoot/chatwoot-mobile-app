import {
  applyFilters,
  getUuid,
  findLastMessage,
  replaceMentionsWithUsernames,
} from 'helpers/conversationHelpers';

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
    const { messages } = conversation;
    expect(findLastMessage(conversation)).toEqual(messages[messages.length - 1]);
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
