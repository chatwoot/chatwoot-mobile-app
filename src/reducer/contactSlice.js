import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

const contactSliceAdapter = createEntityAdapter();

const contactSlice = createSlice({
  name: 'contacts',
  initialState: contactSliceAdapter.getInitialState(),
  reducers: {
    clearContacts: contactSliceAdapter.removeAll,
    addContacts: (state, action) => {
      const { conversations } = action.payload;
      const contacts = conversations.map(chat => chat.meta.sender);
      contacts.map(contact => {
        contactSliceAdapter.upsertOne(state, contact);
        return contact.id;
      });
    },
    addContact: (state, action) => {
      const conversation = action.payload;
      const contact = conversation?.meta?.sender;
      if (contact) {
        contactSliceAdapter.upsertOne(state, contact);
      }
    },
    updateContactsPresence: (state, action) => {
      const { contacts } = action.payload;

      Object.values(state.entities).forEach(entity => {
        const availabilityStatus = contacts[entity.id];
        if (availabilityStatus) {
          entity.availability_status = availabilityStatus;
        } else {
          delete entity.availability_status;
        }
      });
    },
  },
});

export const { clearContacts, addContacts, addContact, updateContactsPresence } =
  contactSlice.actions;

export const selectors = {
  getContactById: (state, contactId) => state.contacts.entities[contactId],
};

export default contactSlice.reducer;
