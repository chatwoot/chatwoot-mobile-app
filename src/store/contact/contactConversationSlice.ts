import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { contactConversationActions } from './contactConversationActions';
import { Conversation } from '@/types';
interface ContactConversationState {
  records: { [key: number]: Conversation[] };
}

const initialState: ContactConversationState = {
  records: {},
};

const contactConversationSlice = createSlice({
  name: 'contactConversation',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(contactConversationActions.getContactConversations.fulfilled, (state, action) => {
        const { contactId, conversations } = action.payload;
        state.records[contactId] = conversations;
      })
      .addCase(contactConversationActions.getContactConversations.rejected, (state, action) => {
        const { contactId } = action.meta.arg;
        state.records[contactId] = state.records[contactId] || [];
      });
  },
});

export const selectContactConversations = (state: RootState) => state.contactConversations.records;

export const selectContactConversationsByContactId = (contactId: number) => (state: RootState) =>
  state.contactConversations.records[contactId] || [];

export const selectHasLoadedContactConversations = (contactId: number) => (state: RootState) =>
  state.contactConversations.records[contactId] !== undefined;

export default contactConversationSlice.reducer;
