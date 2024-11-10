import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypingUser } from '@/types';

interface TypingUserPayload {
  conversationId: number;
  user: TypingUser;
}

interface ConversationTypingState {
  records: { [key: number]: TypingUser[] };
}

const initialState: ConversationTypingState = {
  records: [],
};

const conversationTypingSlice = createSlice({
  name: 'conversationTyping',
  initialState,
  reducers: {
    setTypingUsers: (state, action: PayloadAction<TypingUserPayload>) => {
      const { conversationId, user } = action.payload;
      const records = state.records[conversationId] || [];
      const hasUserRecordAlready = records.some(
        record => record.id === user.id && record.type === user.type,
      );
      if (!hasUserRecordAlready) {
        state.records = {
          [conversationId]: [...records, user],
        };
      }
    },
    removeTypingUser: (state, action: PayloadAction<TypingUserPayload>) => {
      const { conversationId, user } = action.payload;
      state.records[conversationId] = state.records[conversationId].filter(
        record => record.id !== user.id || record.type !== user.type,
      );
    },
  },
});

export const { setTypingUsers, removeTypingUser } = conversationTypingSlice.actions;
export default conversationTypingSlice.reducer;
