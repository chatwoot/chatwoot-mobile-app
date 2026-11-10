import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import type { Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';

import { UpdateLabels } from '../UpdateLabels';

import { Sheet } from '@/components-next/common/sheet/Sheet';
import { useRefsContext, RefsProvider } from '@/context/RefsContext';
import { tailwind } from '@/theme';
import { initialState as defaultHeaderState } from '@/store/conversation/conversationHeaderSlice';

const mockSelectedSlice = createSlice({
  name: 'conversationSelected',
  initialState: {
    selectedConversations: {
      1: {
        id: 1,
        status: 'open',
      },
    },
    selectedConversation: null,
  },
  reducers: {},
});
const mockHeaderSlice = createSlice({
  name: 'conversationHeader',
  initialState: defaultHeaderState,
  reducers: {},
});

const mockLabelSlice = createSlice({
  name: 'labels',
  initialState: {
    ids: [1, 2],
    entities: {
      1: {
        id: 1,
        title: 'Label 1',
        description: 'Label 1 description',
        color: '#28AD21',
      },
      2: {
        id: 2,
        title: 'Label 2',
        description: 'Label 2 description',
        color: '#A53326',
      },
    },
  },
  reducers: {},
});
const mockStore = configureStore({
  reducer: {
    selectedConversation: mockSelectedSlice.reducer,
    conversationHeader: mockHeaderSlice.reducer,
    labels: mockLabelSlice.reducer,
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
  component: UpdateLabels,
} satisfies Meta<typeof UpdateLabels>;

export const ChangeLabel = () => {
  return (
    <BaseBottomSheet>
      <UpdateLabels />
    </BaseBottomSheet>
  );
};
