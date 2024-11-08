import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Conversation } from '@/types/Conversation';
import { conversationActions } from './conversationActions';
import { convertToCamelCase } from '@/utils';

export interface ConversationState {
  meta: {
    mineCount: number;
    unassignedCount: number;
    allCount: number;
  };
  error: string | null;
  uiFlags: {
    isLoadingConversations: boolean;
    isAllConversationsFetched: boolean;
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
    isLoadingConversations: false,
    isAllConversationsFetched: false,
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
        state.uiFlags.isLoadingConversations = true;
      })
      .addCase(conversationActions.fetchConversations.fulfilled, (state, { payload }) => {
        const {
          data: { payload: conversations },
        } = payload;
        const camelCaseConversations = conversations.map(convertToCamelCase);
        conversationAdapter.upsertMany(state, camelCaseConversations);
        state.uiFlags.isLoadingConversations = false;
        state.uiFlags.isAllConversationsFetched = conversations.length < 20 || false;
      })
      .addCase(conversationActions.fetchConversations.rejected, (state, { error }) => {
        state.uiFlags.isLoadingConversations = false;
      });
  },
});

export const { clearAllConversations } = conversationSlice.actions;

export default conversationSlice.reducer;
