import reducer, {
  addContacts,
  addContact,
  clearAllContacts,
  updateContactsPresence,
} from '../contactSlice';
import { contact, conversation } from './contactMockData';

describe('contact reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({
      ids: [],
      entities: {},
    });
  });

  it('should handle clearAllContacts', () => {
    const initialState = {
      ids: [1],
      entities: { 1: contact },
    };
    expect(reducer(initialState, clearAllContacts())).toEqual({
      ids: [],
      entities: {},
    });
  });

  it('should handle addContact', () => {
    const action = addContact(conversation);
    const state = reducer(undefined, action);
    expect(state.entities[contact.id]).toEqual(contact);
  });

  it('should handle addContacts', () => {
    const conversations = [conversation];
    const action = addContacts({ conversations });
    const state = reducer(undefined, action);
    expect(state.entities[contact.id]).toEqual(contact);
  });

  it('should handle updateContactsPresence', () => {
    const initialState = {
      ids: [1],
      entities: { 1: contact },
    };
    const action = updateContactsPresence({ contacts: { 1: 'offline' } });
    const state = reducer(initialState, action);
    expect(state.entities[contact.id]?.availabilityStatus).toEqual('offline');
  });
});
