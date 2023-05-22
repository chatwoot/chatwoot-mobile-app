import I18n from 'i18n';
import { showToast } from 'helpers/ToastHelper';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { createPendingMessage, buildCreatePayload } from 'helpers/conversationHelpers';
import { addMessage } from 'reducer/conversationSlice';

import axios from 'helpers/APIHelper';
import * as RootNavigation from 'helpers/NavigationHelper';
import { MESSAGE_STATUS } from 'constants';
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
    async (_, { getState, rejectWithValue }) => {
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
        return rejectWithValue(error);
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
        const { error: message } = error.response.data;
        const errorMessage = message || I18n.t('CONVERSATION.CONVERSATION_NOT_FOUND');
        showToast({ message: errorMessage });
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
  markMessagesAsUnread: createAsyncThunk(
    'conversations/markMessagesAsUnread',
    async ({ conversationId }, { rejectWithValue }) => {
      try {
        const {
          data: { id, unread_count: unreadCount, agent_last_seen_at: lastSeen },
        } = await axios.post(`conversations/${conversationId}/unread`);
        return { id, unreadCount, lastSeen };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  sendMessage: createAsyncThunk(
    'conversations/sendMessage',
    async ({ data }, { dispatch, rejectWithValue }) => {
      const { conversationId } = data;
      let payload;
      const pendingMessage = createPendingMessage(data);

      try {
        dispatch(
          addMessage({
            ...pendingMessage,
            status: MESSAGE_STATUS.PROGRESS,
          }),
        );
        payload = buildCreatePayload(pendingMessage);

        const response = await axios.post(`conversations/${conversationId}/messages`, payload);
        dispatch(
          addMessage({
            ...response.data,
            status: MESSAGE_STATUS.SENT,
          }),
        );
      } catch (error) {
        dispatch(
          addMessage({
            ...pendingMessage,
            status: MESSAGE_STATUS.FAILED,
          }),
        );
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),

  toggleConversationStatus: createAsyncThunk(
    'conversations/toggleConversationStatus',
    async ({ conversationId, status, snoozedUntil = null }, { rejectWithValue }) => {
      try {
        const response = await axios.post(`conversations/${conversationId}/toggle_status`, {
          status,
          snoozed_until: snoozedUntil,
        });
        const {
          conversation_id: id,
          current_status: updatedStatus,
          snoozed_until: updatedSnoozedUntil,
        } = response.data.payload;
        return {
          id,
          updatedStatus,
          updatedSnoozedUntil,
        };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  muteConversation: createAsyncThunk(
    'conversations/muteConversation',
    async ({ conversationId }, { rejectWithValue }) => {
      try {
        const apiUrl = `conversations/${conversationId}/mute`;
        await axios.post(apiUrl);
        const id = conversationId;
        return { id };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  unmuteConversation: createAsyncThunk(
    'conversations/unmuteConversation',
    async ({ conversationId }, { rejectWithValue }) => {
      try {
        const apiUrl = `conversations/${conversationId}/unmute`;
        await axios.post(apiUrl);
        const id = conversationId;
        return { id };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  assignConversation: createAsyncThunk(
    'conversations/assignConversation',
    async ({ conversationId, assigneeId }, { rejectWithValue }) => {
      try {
        const apiUrl = `conversations/${conversationId}/assignments?assignee_id=${assigneeId}`;
        const response = await axios.post(apiUrl);

        return response.data;
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  toggleTypingStatus: createAsyncThunk(
    'conversations/toggleTypingStatus',
    async ({ conversationId, typingStatus }, { rejectWithValue }) => {
      const apiUrl = `conversations/${conversationId}/toggle_typing_status`;

      await axios
        .post(apiUrl, {
          typing_status: typingStatus,
        })
        .catch();
    },
  ),
  updateConversationAndMessages: createAsyncThunk(
    'conversations/updateConversationAndMessages',
    async ({ conversationId }, { rejectWithValue }) => {
      try {
        const response = await axios.get(`conversations/${conversationId}`);
        const { data } = response;
        return { data, conversationId };
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
