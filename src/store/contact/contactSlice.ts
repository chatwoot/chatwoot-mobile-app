// This slice is responsible for managing the contacts in the store. It is used to add, update, and remove contacts.
// Whenever there is a new conversation/notification, the contacts are added to the store.
// It also manages the availability status of the contacts
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Contact } from '@/types/Contact';
import { contactActions } from './contactActions';

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
      Object.values(state.entities as Record<string, Contact>).forEach(entity => {
        const contactId = entity.id;
        const newAvailability = contacts[contactId] || 'offline';
        if (entity.availabilityStatus !== newAvailability) {
          entity.availabilityStatus = newAvailability;
        }
      });
    },
  },
  extraReducers: builder => {
    builder.addCase(contactActions.toggleAI.fulfilled, (state, action) => {
      const { contactId, aiEnabled } = action.payload;
      const contact = state.entities[contactId];
      if (contact) {
        contact.customAttributes = {
          ...contact.customAttributes,
          aiEnabled: aiEnabled,
        };
      }
    });
  },
});

export const { clearAllContacts, updateContact, addContacts, addContact, updateContactsPresence } =
  contactSlice.actions;

export default contactSlice.reducer;
