import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { FunnelService } from './funnelService';
import type {
  FunnelStage,
  FetchStageColumnPayload,
  FetchStageColumnResult,
  UpdateConversationFunnelPayload,
  FunnelCard,
  ApiErrorResponse,
} from './funnelTypes';

export const funnelActions = {
  fetchStages: createAsyncThunk<FunnelStage[], void>(
    'funnel/fetchStages',
    async (_, { rejectWithValue }) => {
      try {
        return await FunnelService.fetchStages();
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  fetchStageColumn: createAsyncThunk<FetchStageColumnResult, FetchStageColumnPayload>(
    'funnel/fetchStageColumn',
    async (payload, { rejectWithValue }) => {
      try {
        return await FunnelService.fetchStageColumn(payload);
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  updateConversationFunnel: createAsyncThunk<FunnelCard, UpdateConversationFunnelPayload>(
    'funnel/updateConversationFunnel',
    async (payload, { rejectWithValue }) => {
      try {
        return await FunnelService.updateConversationFunnel(payload);
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
};
