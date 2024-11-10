import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Contact } from '@/types/Contact';
import { Conversation } from '@/types/Conversation';
import { transformContact } from '@/utils';

export const contactAdapter = createEntityAdapter<Contact>({
  selectId: contact => contact.id,
});

const initialState = contactAdapter.getInitialState({});

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    clearAllContacts: contactAdapter.removeAll,
    addContacts: (state, action) => {
      const { conversations } = action.payload;
      const contacts = conversations.map((conversation: Conversation) => conversation.meta.sender);
      const camelCaseContacts = contacts.map(transformContact);
      camelCaseContacts.map((contact: Contact) => {
        contactAdapter.upsertOne(state, contact);
        return contact.id;
      });
    },
    addContact: (state, action) => {
      const conversation = action.payload as Conversation;
      const contact = conversation?.meta?.sender;
      const camelCaseContact = transformContact(contact);
      if (camelCaseContact) {
        contactAdapter.upsertOne(state, camelCaseContact);
      }
    },
    updateContactsPresence: (state, action) => {
      const { contacts } = action.payload;
      Object.values(state.entities).forEach(entity => {
        const contactId = entity?.id;
        if (!contactId) return;
        const availabilityStatus = contacts[contactId];
        if (availabilityStatus) {
          entity.availabilityStatus = availabilityStatus;
        } else {
          delete entity.availabilityStatus;
        }
      });
    },
  },
});

export const { clearAllContacts, addContacts, addContact } = contactSlice.actions;

export default contactSlice.reducer;
