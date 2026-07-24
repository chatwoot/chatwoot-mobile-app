import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import type { Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AssigneeTypeFilters } from '../AssigneeTypeFilters';
import { defaultFilterState } from '@/store/conversation/conversationFilterSlice';
import { Sheet } from '@/components-next/common/sheet/Sheet';
import { useRefsContext, RefsProvider } from '@/context/RefsContext';
import { tailwind } from '@/theme';
import { ConversationFilterOptions } from '@/types';

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

const mockStore = configureStore({
  reducer: {
    conversationFilter: mockFilterSlice.reducer,
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
  title: 'Conversation Filters',
  component: AssigneeTypeFilters,
} satisfies Meta<typeof AssigneeTypeFilters>;

export const AssigneeType = () => {
  return (
    <BaseBottomSheet>
      <AssigneeTypeFilters />
    </BaseBottomSheet>
  );
};
