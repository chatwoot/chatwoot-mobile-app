// This slice is responsible for managing the contacts in the store. It is used to add, update, and remove contacts.
// Whenever there is a new conversation, the contacts are added to the store.
// It also manages the availability status of the contacts
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Contact } from '@/types/Contact';
import { Conversation } from '@/types/Conversation';

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
      contacts.map((contact: Contact) => {
        contactAdapter.upsertOne(state, contact);
        return contact.id;
      });
    },
    addContact: (state, action) => {
      const conversation = action.payload as Conversation;
      const contact = conversation?.meta?.sender;
      if (contact) {
        contactAdapter.upsertOne(state, contact);
      }
    },
    updateContactsPresence: (state, action) => {
      const { contacts } = action.payload;
      if (!contacts) return;
      Object.values(state.entities).forEach(entity => {
        if (!entity) return;
        const contactId = entity.id;
        if (!contactId) return;
        const availabilityStatus = contacts[contactId];
        if (availabilityStatus) {
          entity.availabilityStatus = availabilityStatus || 'offline';
        } else {
          entity.availabilityStatus = 'offline';
        }
      });
    },
  },
});

export const { clearAllContacts, addContacts, addContact, updateContactsPresence } =
  contactSlice.actions;

export default contactSlice.reducer;
