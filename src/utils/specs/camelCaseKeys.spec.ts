import { transformConversation, transformContact } from '@/utils/camelCaseKeys';

export const smallCaseConversation = {
  id: 250,
  account_id: 1,
  meta: {
    sender: {
      id: 1,
      name: 'Test Sender',
      thumbnail: '',
      email: '',
      phone_number: null,
    },
    assignee: null,
    team: null,
    hmacVerified: false,
    channel: 'Channel::Whatsapp',
  },
};

export const smallCaseContact = {
  id: 1,
  name: 'Test Contact',
  availability_status: 'available',
};

describe('camelCaseKeys', () => {
  it('should transform conversation', () => {
    const transformed = transformConversation(smallCaseConversation);
    expect(transformed).toEqual({
      id: 250,
      accountId: 1,
      meta: {
        sender: {
          id: 1,
          name: 'Test Sender',
          thumbnail: '',
          email: '',
          phoneNumber: null,
        },
        assignee: null,
        team: null,
        hmacVerified: false,
        channel: 'Channel::Whatsapp',
      },
      messages: [],
    });
  });

  it('should default messages to an empty list when the api omits them', () => {
    expect(transformConversation({ id: 250 }).messages).toEqual([]);
  });

  it('should keep the messages the api sends', () => {
    const transformed = transformConversation({
      id: 250,
      messages: [{ id: 1, message_type: 0 }],
    });
    expect(transformed.messages).toEqual([{ id: 1, messageType: 0 }]);
  });

  it('should transform contact', () => {
    const transformed = transformContact(smallCaseContact);
    expect(transformed).toEqual({
      id: 1,
      name: 'Test Contact',
      availabilityStatus: 'available',
    });
  });
});
