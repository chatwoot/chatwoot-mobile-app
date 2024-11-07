import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Conversation } from '@/types/Conversation';
import { conversationActions } from './conversationActions';

export interface ConversationState {
  meta: {
    mineCount: number;
    unassignedCount: number;
    allCount: number;
  };
  error: string | null;
  uiFlags: {
    isLoading: boolean;
  };
}

export const conversationAdapter = createEntityAdapter<Conversation>({
  selectId: conversation => conversation.id,
});

const initialState = conversationAdapter.getInitialState<ConversationState>({
  meta: {
    mineCount: 0,
    unassignedCount: 0,
    allCount: 0,
  },
  error: null,
  uiFlags: {
    isLoading: false,
  },
});

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    clearAllConversations: conversationAdapter.removeAll,
  },
  extraReducers: builder => {
    builder
      .addCase(conversationActions.fetchConversations.pending, state => {
        state.uiFlags.isLoading = true;
      })
      .addCase(conversationActions.fetchConversations.fulfilled, (state, { payload }) => {
        const {
          data: { payload: conversations },
        } = payload;
        conversationAdapter.upsertMany(state, conversations);
        state.uiFlags.isLoading = false;
      })
      .addCase(conversationActions.fetchConversations.rejected, (state, { error }) => {
        state.uiFlags.isLoading = false;
      });
  },
});

export const { clearAllConversations } = conversationSlice.actions;

export default conversationSlice.reducer;
