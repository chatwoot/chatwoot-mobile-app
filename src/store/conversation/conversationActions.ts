import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConversationService } from './conversationService';
import type { ConversationResponse, ConversationPayload } from './conversationTypes';
import I18n from '@/i18n';
import { handleApiError } from '../auth/authUtils';

const createConversationThunk = <TResponse, TPayload>(
  type: string,
  handler: (payload: TPayload) => Promise<TResponse>,
  errorMessage?: string,
) => {
  return createAsyncThunk<TResponse, TPayload>(type, async (payload, { rejectWithValue }) => {
    try {
      return await handler(payload);
    } catch (error) {
      return rejectWithValue(handleApiError(error, errorMessage));
    }
  });
};

export const conversationActions = {
  fetchConversations: createConversationThunk<ConversationResponse, ConversationPayload>(
    'conversations/fetchConversations',
    async payload => ConversationService.getConversations(payload),
    I18n.t('ERRORS.CONVERSATIONS_FETCH'),
  ),
};
