import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

const conversationTypingAdapter = createEntityAdapter();

const typingSlice = createSlice({
  name: 'conversationTypingStatus',
  initialState: conversationTypingAdapter.getInitialState({
    records: {},
  }),
  reducers: {
    addUserToTyping: (state, action) => {
      const { conversationId, user } = action.payload;
      const records = state.records[conversationId] || [];
      const hasUserRecordAlready = !!records.filter(
        record => record.id === user.id && record.type === user.type,
      ).length;

      if (!hasUserRecordAlready) {
        state.records[conversationId] = [...records, user];
      }
    },
    destroyUserFromTyping: (state, action) => {
      const { conversationId, user } = action.payload;
      const records = state.entities[conversationId] || [];
      const updatedRecords = records.filter(
        record => record.id !== user.id || record.type !== user.type,
      );
      state.records[conversationId] = updatedRecords;
    },
  },
});
export const { addUserToTyping, destroyUserFromTyping } = typingSlice.actions;

export const selectAllTypingUsers = state => state.conversationTypingStatus.records;

export default typingSlice.reducer;
