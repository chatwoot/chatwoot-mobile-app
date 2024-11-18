import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

type ActionType = 'Assign' | 'Status' | 'Label' | 'TeamAssign' | null;

interface ActionState {
  currentActionState: ActionType;
}

const initialState: ActionState = {
  currentActionState: null,
};

const conversationActionSlice = createSlice({
  name: 'conversationAction',
  initialState,
  reducers: {
    setActionState: (state, action: PayloadAction<ActionType>) => {
      state.currentActionState = action.payload;
    },
    resetActionState: state => {
      state.currentActionState = null;
    },
  },
});

export const selectCurrentActionState = (state: RootState) =>
  state.conversationAction.currentActionState;

export const { setActionState, resetActionState } = conversationActionSlice.actions;
export default conversationActionSlice.reducer;
