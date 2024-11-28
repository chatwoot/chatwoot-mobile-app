import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { defaultFilterState } from '@/store/conversation/conversationFilterSlice';
import { ConversationFilterOptions } from '@/types';

import { ConversationFilterBar as ConversationFilterBarComponent } from './ConversationFilterBar';

const mockFilterSlice = createSlice({
  name: 'conversationFilter',
  initialState: {
    filters: defaultFilterState,
  },
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<{ key: ConversationFilterOptions; value: string }>,
    ) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
  },
});

const mockInboxSlice = createSlice({
  name: 'inbox',
  initialState: {
    ids: [1, 2],
    entities: {
      1: { id: 1, name: 'Inbox 1' },
      2: { id: 2, name: 'Inbox 2' },
    },
    uiFlags: {
      isLoading: false,
    },
  },
  reducers: {},
});

const mockStore = configureStore({
  reducer: {
    conversationFilter: mockFilterSlice.reducer,
    inboxes: mockInboxSlice.reducer,
  },
});

const meta = {
  title: 'Conversation Filters',
  component: ConversationFilterBarComponent,
  decorators: [
    Story => (
      <Provider store={mockStore}>
        <View style={{ flex: 1, padding: 16 }}>
          <Story />
        </View>
      </Provider>
    ),
  ],
} satisfies Meta<typeof ConversationFilterBarComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FilterBar: Story = {};
