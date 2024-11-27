import React from 'react';
import { View } from 'react-native';
import type { Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

import { StatusListSheet } from '../StatusListSheet';
import { defaultFilterState } from '@/store/conversation/conversationFilterSlice';
import { Button } from '@/components-next';
import { BottomSheetBackdrop } from '@/components-next/common/bottomsheet/BottomSheetBackdrop';
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
  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const { filtersModalSheetRef } = useRefsContext();

  return (
    <Provider store={mockStore}>
      <BottomSheetModalProvider>
        <RefsProvider>
          <View style={tailwind.style('flex-1 bg-white p-4')}>
            <Button
              text="Open Status Options"
              handlePress={() => filtersModalSheetRef.current?.present()}
            />

            <BottomSheetModal
              ref={filtersModalSheetRef}
              backdropComponent={BottomSheetBackdrop}
              handleIndicatorStyle={tailwind.style(
                'overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]',
              )}
              detached
              enablePanDownToClose
              animationConfigs={animationConfigs}
              handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
              style={tailwind.style('overflow-hidden')}
              snapPoints={['50%']}>
              <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                {children}
              </BottomSheetScrollView>
            </BottomSheetModal>
          </View>
        </RefsProvider>
      </BottomSheetModalProvider>
    </Provider>
  );
};

export default {
  title: 'ConversationFilters',
  component: StatusListSheet,
} satisfies Meta<typeof StatusListSheet>;

export const Status = () => {
  return (
    <BaseBottomSheet>
      <StatusListSheet />
    </BaseBottomSheet>
  );
};
