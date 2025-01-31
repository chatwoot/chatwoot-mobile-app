// This slice is responsible for managing the contacts in the store. It is used to add, update, and remove contacts.
// Whenever there is a new conversation/notification, the contacts are added to the store.
// It also manages the availability status of the contacts
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Contact } from '@/types/Contact';

export const contactAdapter = createEntityAdapter<Contact>();

const initialState = contactAdapter.getInitialState({});

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    clearAllContacts: contactAdapter.removeAll,
    addContacts: (state, action) => {
      const { contacts } = action.payload;
      contacts.map((contact: Contact) => {
        contactAdapter.upsertOne(state, contact);
        return contact.id;
      });
    },
    addContact: (state, action) => {
      const contact = action.payload as Contact;
      if (contact) {
        contactAdapter.upsertOne(state, contact);
      }
    },
    updateContact: (state, action) => {
      const contact = action.payload as Contact;
      if (contact) {
        contactAdapter.upsertOne(state, contact);
      }
    },
    updateContactsPresence: (state, action) => {
      const { contacts } = action.payload;
      const { selectById } = contactAdapter.getSelectors();
      Object.keys(contacts).forEach(contactId => {
        const numericId = Number(contactId);
        const entity = selectById(state, numericId);
        if (entity) {
          contactAdapter.updateOne(state, {
            id: numericId,
            changes: { availabilityStatus: contacts[contactId] || 'offline' },
          });
        }
      });
    },
  },
});

export const { clearAllContacts, updateContact, addContacts, addContact, updateContactsPresence } =
  contactSlice.actions;

export default contactSlice.reducer;
