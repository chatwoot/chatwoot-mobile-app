import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { Agent } from '@/types';
import { conversationParticipantActions } from './conversationParticipantActions';

export interface ConversationParticipantState {
  records: { [key: number]: Agent[] };
  uiFlags: {
    loading: boolean;
  };
}

const conversationParticipantAdapter = createEntityAdapter();

const initialState: ConversationParticipantState = conversationParticipantAdapter.getInitialState({
  uiFlags: {
    loading: false,
  },
  records: {},
});

const conversationParticipantSlice = createSlice({
  name: 'conversationParticipants',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(conversationParticipantActions.index.pending, state => {
        state.uiFlags.loading = true;
      })
      .addCase(conversationParticipantActions.index.fulfilled, (state, action) => {
        const { participants, conversationId } = action.payload;
        state.records[conversationId] = participants;
        state.uiFlags.loading = false;
      })
      .addCase(conversationParticipantActions.index.rejected, state => {
        state.uiFlags.loading = false;
      });
  },
});

export default conversationParticipantSlice.reducer;
