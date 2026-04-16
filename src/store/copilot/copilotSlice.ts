import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { executeCopilotAction, sendCopilotFollowUp } from './copilotActions';
import type { RootState } from '@/store';

interface CopilotSliceState {
  isGenerating: boolean;
  generatedContent: string;
  showEditor: boolean;
  followUpContext: Record<string, unknown> | null;
  originalContent: string;
  error: string | null;
}

const initialState: CopilotSliceState = {
  isGenerating: false,
  generatedContent: '',
  showEditor: false,
  followUpContext: null,
  originalContent: '',
  error: null,
};

const copilotSlice = createSlice({
  name: 'copilot',
  initialState,
  reducers: {
    setOriginalContent: (state, action: PayloadAction<string>) => {
      state.originalContent = action.payload;
    },
    resetCopilot: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(executeCopilotAction.pending, state => {
        state.isGenerating = true;
        state.showEditor = true;
        state.generatedContent = '';
        state.error = null;
      })
      .addCase(executeCopilotAction.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generatedContent = action.payload.message;
        state.followUpContext = action.payload.follow_up_context;
      })
      .addCase(executeCopilotAction.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.isGenerating = false;
        state.showEditor = false;
        state.error = action.error.message ?? 'Failed to generate content';
      })
      .addCase(sendCopilotFollowUp.pending, state => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(sendCopilotFollowUp.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generatedContent = action.payload.message;
        state.followUpContext = action.payload.follow_up_context;
      })
      .addCase(sendCopilotFollowUp.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.isGenerating = false;
        state.error = action.error.message ?? 'Failed to send follow-up';
      });
  },
});

export const selectIsGenerating = (state: RootState) => state.copilot.isGenerating;
export const selectGeneratedContent = (state: RootState) => state.copilot.generatedContent;
export const selectShowCopilotEditor = (state: RootState) => state.copilot.showEditor;
export const selectOriginalContent = (state: RootState) => state.copilot.originalContent;
export const selectFollowUpContext = (state: RootState) => state.copilot.followUpContext;
export const selectCopilotError = (state: RootState) => state.copilot.error;
export const selectIsCopilotActive = (state: RootState) =>
  state.copilot.showEditor || state.copilot.isGenerating;

export const { setOriginalContent, resetCopilot } = copilotSlice.actions;
export default copilotSlice.reducer;
