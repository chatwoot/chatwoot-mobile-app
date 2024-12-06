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
    builder.addCase(
      contactConversationActions.getContactConversations.fulfilled,
      (state, action) => {
        const { contactId, conversations } = action.payload;
        state.records[contactId] = conversations;
      },
    );
  },
});

export const selectContactConversations = (state: RootState) => state.contactConversations.records;

export default contactConversationSlice.reducer;
