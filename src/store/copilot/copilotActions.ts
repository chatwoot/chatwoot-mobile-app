import { createAsyncThunk } from '@reduxjs/toolkit';
import { CopilotService } from './copilotService';
import { REWRITE_ACTIONS } from '@/constants/copilot';
import type { CopilotActionKey, CopilotTaskResponse } from '@/types/Copilot';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/store/conversation/conversationTypes';

interface ExecuteCopilotActionPayload {
  actionKey: CopilotActionKey;
  content: string;
  conversationId: number;
}

interface SendCopilotFollowUpPayload {
  followUpContext: Record<string, unknown>;
  message: string;
  conversationId: number;
}

export const executeCopilotAction = createAsyncThunk<
  CopilotTaskResponse,
  ExecuteCopilotActionPayload
>('copilot/executeCopilotAction', async (payload, { rejectWithValue, signal }) => {
  try {
    const { actionKey, content, conversationId } = payload;

    if (REWRITE_ACTIONS.includes(actionKey as (typeof REWRITE_ACTIONS)[number])) {
      return await CopilotService.rewrite(
        { content, operation: actionKey, conversationId },
        signal,
      );
    }

    if (actionKey === 'summarize') {
      return await CopilotService.summarize({ conversationId }, signal);
    }

    if (actionKey === 'reply_suggestion') {
      return await CopilotService.replySuggestion({ conversationId }, signal);
    }

    throw new Error(`Unknown copilot action: ${actionKey}`);
  } catch (error) {
    const { response } = error as AxiosError<ApiErrorResponse>;
    if (!response) {
      throw error;
    }
    return rejectWithValue(response.data);
  }
});

export const sendCopilotFollowUp = createAsyncThunk<
  CopilotTaskResponse,
  SendCopilotFollowUpPayload
>('copilot/sendCopilotFollowUp', async (payload, { rejectWithValue, signal }) => {
  try {
    return await CopilotService.followUp(payload, signal);
  } catch (error) {
    const { response } = error as AxiosError<ApiErrorResponse>;
    if (!response) {
      throw error;
    }
    return rejectWithValue(response.data);
  }
});
