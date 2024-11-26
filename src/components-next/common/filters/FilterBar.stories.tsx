import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';

import { FilterBar } from './FilterBar';
import { inboxAdapter } from '@/store/inbox/inboxSlice';
import { defaultFilterState } from '@/store/conversation/conversationFilterSlice';

// Mock inbox data
const MockedInboxes = [
  { id: 1, name: 'Email Inbox' },
  { id: 2, name: 'Website Inbox' },
  { id: 3, name: 'Facebook Inbox' },
];

// Create mock initial state
const MockedState = {
  inboxes: inboxAdapter.getInitialState({
    ids: MockedInboxes.map(inbox => inbox.id),
    entities: MockedInboxes.reduce(
      (acc, inbox) => ({
        ...acc,
        [inbox.id]: inbox,
      }),
      {},
    ),
    uiFlags: {
      isLoading: false,
    },
  }),
  conversationFilter: createSlice({
    name: 'conversationFilter',
    initialState: {
      filters: defaultFilterState,
    },
    reducers: {},
  }).reducer,
  conversationHeader: createSlice({
    name: 'conversationHeader',
    initialState: {
      currentState: 'none',
      searchTerm: '',
      currentBottomSheet: 'none',
    },
    reducers: {},
  }).reducer,
};

// Create mock store
const MockStore = ({ children }: { children: React.ReactNode }) => (
  <Provider
    store={configureStore({
      reducer: {
        inboxes: createSlice({
          name: 'inboxes',
          initialState: MockedState.inboxes,
          reducers: {},
        }).reducer,
        conversationFilter: MockedState.conversationFilter,
        conversationHeader: MockedState.conversationHeader,
      },
    })}>
    {children}
  </Provider>
);

const meta = {
  title: 'FilterBar',
  component: FilterBar,
  decorators: [
    Story => (
      <View style={{ flex: 1, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [Story => <MockStore>{Story()}</MockStore>],
};
