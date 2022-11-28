import I18n from 'i18n';
import { showToast } from 'helpers/ToastHelper';
import { createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'helpers/APIHelper';
import * as RootNavigation from 'helpers/NavigationHelper';

const actions = {
  fetchConversations: createAsyncThunk(
    'conversations/fetchConversations',
    async (
      { pageNumber = 1, assigneeType = 'mine', conversationStatus = 'open', inboxId = 0 },
      { rejectWithValue },
    ) => {
      try {
        const params = {
          inbox_id: inboxId || null,
          assignee_type: assigneeType === 'mine' ? 'me' : assigneeType,
          status: conversationStatus,
          page: pageNumber,
        };
        const response = await axios.get('conversations', {
          params,
        });
        const {
          data: { meta, payload },
        } = response.data;
        return {
          conversations: payload,
          meta,
        };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  fetchConversationStats: createAsyncThunk(
    'conversations/fetchConversationStats',
    async (_, { getState }) => {
      try {
        const {
          conversations: { currentInbox, assigneeType, conversationStatus },
        } = getState();
        // TODO: Move to helpers since this is used in multiple places
        const params = {
          inbox_id: currentInbox || null,
          assignee_type: assigneeType === 'mine' ? 'me' : assigneeType,
          status: conversationStatus,
        };
        const response = await axios.get('conversations/meta', {
          params,
        });
        const {
          data: { meta },
        } = response;
        return { meta };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
      }
    },
  ),
  fetchPreviousMessages: createAsyncThunk(
    'conversations/fetchPreviousMessages',
    async ({ conversationId, beforeId }, { rejectWithValue }) => {
      try {
        const response = await axios.get(`conversations/${conversationId}/messages`, {
          params: {
            before: beforeId,
          },
        });
        const {
          data: { payload, meta },
        } = response;
        // TODO: Commit meta to store
        return { data: payload, meta, conversationId };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  fetchConversation: createAsyncThunk(
    'conversations/fetchConversation',
    async ({ conversationId }, { rejectWithValue }) => {
      try {
        const response = await axios.get(`conversations/${conversationId}`);
        const { data } = response;
        return data;
      } catch (error) {
        const errorMessage =
          error?.response?.data?.error?.message || I18n.t('CONVERSATION.CONVERSATION_NOT_FOUND');
        if (!error.response) {
          throw error;
        }
        showToast({
          type: 'error',
          title: errorMessage,
        });
        RootNavigation.navigate('ConversationScreen');
        return rejectWithValue(error.response.data);
      }
    },
  ),
  markMessagesAsRead: createAsyncThunk(
    'conversations/markMessagesAsRead',
    async ({ conversationId }, { rejectWithValue }) => {
      try {
        const {
          data: { id, agent_last_seen_at: lastSeen },
        } = await axios.post(`conversations/${conversationId}/update_last_seen`);
        return { id, lastSeen };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
};

export default actions;
