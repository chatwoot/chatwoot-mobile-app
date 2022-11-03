import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  createDraftSafeSelector,
} from '@reduxjs/toolkit';
import axios from 'helpers/APIHelper';
import { applyFilters } from 'helpers/conversationHelpers';

export const conversationAdapter = createEntityAdapter({
  selectId: conversation => conversation.id,
});

export const actions = {
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
};

const conversationSlice = createSlice({
  name: 'conversations',
  initialState: conversationAdapter.getInitialState({
    loading: false,
    meta: {
      mine_count: 0,
      unassigned_count: 0,
      all_count: 0,
    },
    isAllConversationsFetched: false,
    isAllMessagesFetched: false,
    conversationStatus: 'open',
    assigneeType: 'mine',
    currentInbox: 0,
    loadingMessages: false,
  }),
  reducers: {
    clearAllConversations: conversationAdapter.removeAll,
    setConversationStatus: (state, action) => {
      state.conversationStatus = action.payload;
    },
    setAssigneeType: (state, action) => {
      state.assigneeType = action.payload;
    },
    setActiveInbox: (state, action) => {
      state.currentInbox = action.payload;
    },
    addConversation: (state, action) => {
      const { currentInbox } = state;
      const conversation = action.payload;
      const { inbox_id: inboxId } = conversation;
      const isMatchingInboxFilter = !currentInbox || Number(currentInbox) === inboxId;
      if (isMatchingInboxFilter) {
        conversationAdapter.addOne(state, action.payload);
      }
    },
    updateConversation: (state, action) => {
      const conversation = action.payload;
      const conversationIds = conversationAdapter.getSelectors().selectIds(state);
      if (conversationIds.includes(conversation.id)) {
        const { messages, ...conversationAttributes } = conversation;
        conversationAdapter.updateOne(state, {
          id: conversation.id,
          changes: conversationAttributes,
        });
      } else {
        conversationAdapter.addOne(state, conversation);
      }
    },
  },
  extraReducers: {
    [actions.fetchConversations.pending]: state => {
      state.loading = true;
    },
    [actions.fetchConversations.fulfilled]: (state, { payload }) => {
      conversationAdapter.upsertMany(state, payload.conversations);
      state.meta = payload.meta;
      state.loading = false;
      state.isAllConversationsFetched = payload.conversations.length < 20;
    },
    [actions.fetchConversations.rejected]: (state, { error }) => {
      state.loading = false;
    },
    [actions.fetchConversationStats.fulfilled]: (state, { payload }) => {
      state.meta = payload.meta;
    },
  },
});
export const conversationSelector = conversationAdapter.getSelectors(state => state.conversations);

export const selectors = {
  getFilteredConversations: createDraftSafeSelector(
    [conversationSelector.selectAll, (_, filters) => filters],
    (conversations, filters) => {
      const { assigneeType, userId } = filters;
      const sortedConversations = conversations.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
      if (assigneeType === 'mine') {
        return sortedConversations.filter(conversation => {
          const { assignee } = conversation.meta;
          const shouldFilter = applyFilters(conversation, filters);
          const isAssignedToMe = assignee && assignee.id === userId;
          const isChatMine = isAssignedToMe && shouldFilter;
          return isChatMine;
        });
      }
      if (assigneeType === 'unassigned') {
        return sortedConversations.filter(conversation => {
          const isUnAssigned = !conversation.meta.assignee;
          const shouldFilter = applyFilters(conversation, filters);
          return isUnAssigned && shouldFilter;
        });
      }

      return sortedConversations.filter(conversation => {
        const shouldFilter = applyFilters(conversation, filters);
        return shouldFilter;
      });
    },
  ),
};

export default conversationSlice.reducer;
