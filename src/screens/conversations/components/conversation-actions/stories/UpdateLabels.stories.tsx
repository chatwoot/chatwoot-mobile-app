import React, { useEffect } from 'react';
import { View } from 'react-native';
import type { Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

import { UpdateLabels } from '../UpdateLabels';

import { BottomSheetBackdrop } from '@/components-next/common/bottomsheet/BottomSheetBackdrop';
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
  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const { filtersModalSheetRef } = useRefsContext();

  useEffect(() => {
    filtersModalSheetRef.current?.present();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Provider store={mockStore}>
      <BottomSheetModalProvider>
        <RefsProvider>
          <View style={tailwind.style('flex-1 bg-white p-4')}>
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
