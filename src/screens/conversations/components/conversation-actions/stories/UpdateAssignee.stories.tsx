import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import type { Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';

import { UpdateAssignee } from '../UpdateAssignee';
import { Sheet } from '@/components-next/common/sheet/Sheet';
import { useRefsContext, RefsProvider } from '@/context/RefsContext';
import { tailwind } from '@/theme';

const mockSelectedSlice = createSlice({
  name: 'conversationSelected',
  initialState: {
    selectedConversations: {
      1: {
        id: 1,
        status: 'open',
        inboxId: 1,
      },
    },
    selectedConversation: null,
  },
  reducers: {},
});

const mockAssignableAgentSlice = createSlice({
  name: 'assignableAgents',
  initialState: {
    records: {
      1: [
        {
          id: 1,
          name: 'Agent 1',
        },
        {
          id: 2,
          name: 'Agent 2',
        },
      ],
    },
    uiFlags: {
      isLoading: false,
    },
  },
  reducers: {},
});

const mockStore = configureStore({
  reducer: {
    selectedConversation: mockSelectedSlice.reducer,
    assignableAgents: mockAssignableAgentSlice.reducer,
  },
});

const BaseBottomSheet = ({ children }: { children: React.ReactNode }) => {
  const { filtersModalSheetRef } = useRefsContext();

  useEffect(() => {
    filtersModalSheetRef.current?.present();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Provider store={mockStore}>
      <RefsProvider>
        <View style={tailwind.style('flex-1 bg-white p-4')}>
          <Sheet ref={filtersModalSheetRef} detents={[0.5]} scrollable>
            <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
          </Sheet>
        </View>
      </RefsProvider>
    </Provider>
  );
};

export default {
  title: 'Conversation Single & Bulk Actions',
  component: UpdateAssignee,
} satisfies Meta<typeof UpdateAssignee>;

export const ChangeAssignee = () => {
  return (
    <BaseBottomSheet>
      <UpdateAssignee />
    </BaseBottomSheet>
  );
};
