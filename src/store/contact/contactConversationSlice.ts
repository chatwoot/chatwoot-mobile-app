import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { contactConversationActions } from './contactConversationActions';
import { Conversation } from '@/types';
interface ContactConversationState {
  records: { [key: number]: Conversation[] };
  uiFlags: { [key: number]: { isFetching: boolean } };
}

const initialState: ContactConversationState = {
  records: {},
  uiFlags: {},
};

const contactConversationSlice = createSlice({
  name: 'contactConversation',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(contactConversationActions.getContactConversations.pending, (state, action) => {
      const { contactId } = action.meta.arg;
      state.uiFlags[contactId] = { isFetching: true };
    });
    builder.addCase(
      contactConversationActions.getContactConversations.fulfilled,
      (state, action) => {
        const { contactId, conversations } = action.payload;
        state.records[contactId] = conversations;
        state.uiFlags[contactId] = { isFetching: false };
      },
    );
    builder.addCase(
      contactConversationActions.getContactConversations.rejected,
      (state, action) => {
        const { contactId } = action.meta.arg;
        state.uiFlags[contactId] = { isFetching: false };
      },
    );
  },
});

export const selectContactConversations = (state: RootState) => state.contactConversations.records;

export const selectContactConversationsByContactId = (contactId: number) => (state: RootState) =>
  state.contactConversations.records[contactId] || [];

export const selectContactConversationsUiFlags =
  (contactId: number) =>
  (state: RootState): { isFetching: boolean } =>
    state.contactConversations.uiFlags[contactId] || { isFetching: false };

export default contactConversationSlice.reducer;
