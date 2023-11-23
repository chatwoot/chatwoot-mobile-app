import I18n from 'i18n';
import { showToast } from 'helpers/ToastHelper';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Platform } from 'react-native';

import { createPendingMessage, buildCreatePayload } from 'helpers/conversationHelpers';
import { addOrUpdateMessage } from 'reducer/conversationSlice';

import axios from 'helpers/APIHelper';
import * as RootNavigation from 'helpers/NavigationHelper';
import { MESSAGE_STATUS } from 'constants';

import { addContacts, addContact } from 'reducer/contactSlice';

const actions = {
  fetchConversations: createAsyncThunk(
    'conversations/fetchConversations',
    async (
      {
        pageNumber = 1,
        assigneeType = 'mine',
        conversationStatus = 'open',
        inboxId = 0,
        sortBy = 'latest',
      },
      { dispatch, rejectWithValue },
    ) => {
      try {
        const params = {
          inbox_id: inboxId || null,
          assignee_type: assigneeType === 'mine' ? 'me' : assigneeType,
          status: conversationStatus,
          page: pageNumber,
          sort_by: sortBy,
        };
        const response = await axios.get('conversations', {
          params,
        });
        const {
          data: { meta, payload },
        } = response.data;
        dispatch(
          addContacts({
            conversations: payload,
          }),
        );
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
    async ({ conversationId }, { dispatch, rejectWithValue }) => {
      try {
        const response = await axios.get(`conversations/${conversationId}`);
        const { data } = response;
        dispatch(addContact(data));
        return data;
      } catch (error) {
        const { error: message } = error.response.data;
        const errorMessage = message || I18n.t('CONVERSATION.CONVERSATION_NOT_FOUND');
        showToast({ message: errorMessage });
        RootNavigation.replace('Tab');
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
          addOrUpdateMessage({
            ...pendingMessage,
            status: MESSAGE_STATUS.PROGRESS,
          }),
        );
        payload = buildCreatePayload(pendingMessage);
        const { file } = data;

        const contentType =
          Platform.OS === 'ios' && file
            ? file.type
            : Platform.OS === 'android' && file
            ? 'multipart/form-data'
            : 'application/json';

        const response = await axios.post(`conversations/${conversationId}/messages`, payload, {
          headers: {
            'Content-Type': contentType,
          },
        });
        dispatch(
          addOrUpdateMessage({
            ...response.data,
            status: MESSAGE_STATUS.SENT,
          }),
        );
      } catch (error) {
        dispatch(
          addOrUpdateMessage({
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
  updateConversation: createAsyncThunk(
    'conversations/updateConversation',
    async ({ conversationId }, { rejectWithValue }) => {
      try {
        const response = await axios.get(`conversations/${conversationId}`);
        const { data } = response;
        return data;
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  deleteMessage: createAsyncThunk(
    'conversations/deleteMessage',
    async ({ conversationId, messageId }, { rejectWithValue }) => {
      try {
        const response = await axios.delete(
          `conversations/${conversationId}/messages/${messageId}`,
        );
        return response.data;
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  togglePriority: createAsyncThunk(
    'conversations/togglePriority',
    async ({ conversationId, priority }, { rejectWithValue }) => {
      try {
        const apiUrl = `conversations/${conversationId}/toggle_priority`;
        await axios.post(apiUrl, {
          priority,
        });
        return {
          id: conversationId,
          priority,
        };
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
