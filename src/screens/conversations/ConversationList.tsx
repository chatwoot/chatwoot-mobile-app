import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, StatusBar } from 'react-native';
import Animated, { LinearTransition, useAnimatedScrollHandler } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';

import { ConversationCell, ConversationError, ConversationListScreenHeader } from './components';

import {
  ActionTabs,
  AssigneeListComponent,
  AssigneeTypeListComponent,
  BottomSheetBackdrop,
  BottomSheetWrapper,
  LabelListComponent,
  SortByListComponent,
  StatusListComponent,
} from '@/components-next';
import { TAB_BAR_HEIGHT } from '@/constants';
import {
  ConversationListStateProvider,
  useConversationListStateContext,
  useRefsContext,
} from '@/context';
import { conversationListData } from '@/mockdata/conversationListMockdata';
import { tailwind } from '@/theme';
import { Conversation } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectBottomSheetState,
  setBottomSheetState,
} from '@/store/conversation/conversationHeaderSlice';
import {
  resetActionState,
  selectCurrentActionState,
} from '@/store/conversation/conversationActionSlice';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

type FlashListRenderItemType = {
  item: Conversation;
  index: number;
};

const ListFooterComponent = () => (
  <Animated.View style={tailwind.style('h-20 flex justify-center items-center')}>
    <ActivityIndicator />
  </Animated.View>
);

const error = {
  message: '',
};

const hasNextPage = false;

const ConversationList = () => {
  const { openedRowIndex } = useConversationListStateContext();

  const handleRender = useCallback(
    ({ item, index }: FlashListRenderItemType) => {
      return (
        <ConversationCell index={index} conversationItem={item} openedRowIndex={openedRowIndex} />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleOnEndReached = () => {
    if (conversationListData.length !== 0) {
      // fetchNextPage();
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      openedRowIndex.value = -1;
    },
  });

  try {
    if (error && error.message) {
      return <ConversationError message={error.message} />;
    }
    return (
      <AnimatedFlashList
        layout={LinearTransition.springify().damping(18).stiffness(120)}
        showsVerticalScrollIndicator={false}
        data={conversationListData}
        estimatedItemSize={91}
        onScroll={scrollHandler}
        onEndReached={handleOnEndReached}
        onEndReachedThreshold={1}
        ListFooterComponent={hasNextPage ? ListFooterComponent : null}
        // @ts-ignore
        renderItem={handleRender}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
      />
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // Handle component API Fetch issue
  }
};

const ConversationListScreen = () => {
  const currentBottomSheet = useAppSelector(selectBottomSheetState);
  const dispatch = useAppDispatch();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const currentActionState = useAppSelector(selectCurrentActionState);
  // ref
  const { filtersModalSheetRef, actionsModalSheetRef } = useRefsContext();
  const { bottom } = useSafeAreaInsets();

  const handleOnDismiss = () => {
    /**
     * Resetting the bottoms heet state to none with a timeout
     * to avoid flickering of bottom sheet
     */
    dispatch(setBottomSheetState('none'));
    dispatch(resetActionState());
  };

  const filterSnapPoints = useMemo(() => {
    switch (currentBottomSheet) {
      case 'status':
        return [261];
      case 'sort_by':
        return [170];
      case 'assignee_type':
        return [170];
      default:
        return [250];
    }
  }, [currentBottomSheet]);

  const actionSnapPoints = useMemo(() => {
    switch (currentActionState) {
      case 'Assign':
        return [368];
      case 'Status':
        return [216];
      case 'Label':
        return [368];
      default:
        return [250];
    }
  }, [currentActionState]);

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <ConversationListStateProvider>
        <ConversationListScreenHeader />
        <ConversationList />
        <BottomSheetModal
          ref={filtersModalSheetRef}
          backdropComponent={BottomSheetBackdrop}
          handleIndicatorStyle={tailwind.style(
            'overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]',
          )}
          handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
          style={tailwind.style('mx-3 rounded-[26px] overflow-hidden')}
          detached
          bottomInset={bottom === 0 ? 12 : bottom}
          animationConfigs={animationConfigs}
          enablePanDownToClose
          snapPoints={filterSnapPoints}
          onDismiss={handleOnDismiss}>
          <BottomSheetWrapper>
            {currentBottomSheet === 'status' ? <StatusListComponent type="Filter" /> : null}
            {currentBottomSheet === 'sort_by' ? <SortByListComponent /> : null}
            {currentBottomSheet === 'assignee_type' ? <AssigneeTypeListComponent /> : null}
          </BottomSheetWrapper>
        </BottomSheetModal>
        <BottomSheetModal
          ref={actionsModalSheetRef}
          backdropComponent={BottomSheetBackdrop}
          handleIndicatorStyle={tailwind.style(
            'overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]',
          )}
          handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
          style={tailwind.style('mx-3 rounded-[26px] overflow-hidden -mt-3')}
          detached
          bottomInset={bottom === 0 ? 12 : bottom}
          animationConfigs={animationConfigs}
          enablePanDownToClose
          snapPoints={actionSnapPoints}
          onDismiss={handleOnDismiss}>
          {currentActionState === 'Assign' ? <AssigneeListComponent /> : null}
          {currentActionState === 'Status' ? <StatusListComponent type="SetStatus" /> : null}
          {currentActionState === 'Label' ? <LabelListComponent /> : null}
        </BottomSheetModal>
        <ActionTabs />
      </ConversationListStateProvider>
    </SafeAreaView>
  );
};

export default ConversationListScreen;
