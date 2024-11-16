import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import Animated, {
  LinearTransition,
  runOnJS,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';

import {
  ConversationItem,
  ConversationHeader,
  InboxListSheet,
  StatusListSheet,
  SortBySheet,
  AssigneeTypeSheet,
  AssigneeListSheet,
  LabelListSheet,
} from './components';

import { ActionTabs, BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';

import { EmptyStateIcon } from '@/svg-icons';
import { TAB_BAR_HEIGHT } from '@/constants';
import {
  ConversationListStateProvider,
  useConversationListStateContext,
  useRefsContext,
} from '@/context';

import { tailwind } from '@/theme';
import { Conversation } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
// import { conversationListData } from '@/mockdata/conversationListMockdata';
// import camelcaseKeys from 'camelcase-keys';
import {
  selectBottomSheetState,
  setBottomSheetState,
} from '@/store/conversation/conversationHeaderSlice';
import {
  resetActionState,
  selectCurrentActionState,
} from '@/store/conversation/conversationActionSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import {
  selectConversationsLoading,
  selectIsAllConversationsFetched,
  getFilteredConversations,
} from '@/store/conversation/conversationSelectors';
import { selectFilters, FilterState } from '@/store/conversation/conversationFilterSlice';
import { ConversationPayload } from '@/store/conversation/conversationTypes';
import { clearAllConversations } from '@/store/conversation/conversationSlice';
import { selectUserId } from '@/store/auth/authSelectors';
import { clearAllContacts } from '@/store/contact/contactSlice';

import i18n from '@/i18n';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

type FlashListRenderItemType = {
  item: Conversation;
  index: number;
};

// const conversationList = conversationListData.map(
//   value => camelcaseKeys(value, { deep: true }) as unknown as Conversation,
// );

const ConversationList = () => {
  const dispatch = useAppDispatch();

  const [isFlashListReady, setFlashListReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const userId = useAppSelector(selectUserId);

  const { openedRowIndex } = useConversationListStateContext();

  const isConversationsLoading = useAppSelector(selectConversationsLoading);
  const isAllConversationsFetched = useAppSelector(selectIsAllConversationsFetched);

  const handleRender = useCallback(
    ({ item, index }: FlashListRenderItemType) => {
      return (
        <ConversationItem index={index} conversationItem={item} openedRowIndex={openedRowIndex} />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const filters = useAppSelector(selectFilters);
  const previousFilters = useRef(filters);

  useEffect(() => {
    if (previousFilters.current !== filters) {
      previousFilters.current = filters;
      clearAndFetchConversations(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    clearAndFetchConversations(filters);
    // fetchConversations(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAndFetchConversations = useCallback(async (filters: FilterState) => {
    setPageNumber(1);
    await dispatch(clearAllConversations());
    await dispatch(clearAllContacts());
    fetchConversations(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ListFooterComponent = () => {
    return (
      <Animated.View
        style={tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`)}>
        {isAllConversationsFetched ? null : <ActivityIndicator size="small" />}
      </Animated.View>
    );
  };

  const handleRefresh = useCallback(() => {
    setFlashListReady(false);
    setIsRefreshing(true);
    clearAndFetchConversations(filters).finally(() => {
      setIsRefreshing(false);
    });
  }, [clearAndFetchConversations, filters]);

  const fetchConversations = useCallback(
    async (filters: FilterState, page: number = 1) => {
      const conversationFilters = {
        status: filters.status,
        assigneeType: filters.assignee_type,
        page: page,
        sortBy: filters.sort_by,
        inboxId: parseInt(filters.inbox_id),
      } as ConversationPayload;

      dispatch(conversationActions.fetchConversations(conversationFilters));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onChangePageNumber = () => {
    const nextPageNumber = pageNumber + 1;
    setPageNumber(nextPageNumber);
    fetchConversations(filters, nextPageNumber);
  };

  const handleOnEndReached = () => {
    const shouldLoadMoreConversations =
      isFlashListReady && !isAllConversationsFetched && !isConversationsLoading;
    if (shouldLoadMoreConversations) {
      onChangePageNumber();
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      openedRowIndex.value = -1;
      if (!isFlashListReady) {
        runOnJS(setFlashListReady)(true);
      }
    },
  });

  const allConversations = useAppSelector(state =>
    getFilteredConversations(state, filters, userId),
  );

  const shouldShowEmptyLoader = isConversationsLoading && allConversations.length === 0;

  return shouldShowEmptyLoader ? (
    <Animated.View
      style={tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`)}>
      <ActivityIndicator />
    </Animated.View>
  ) : allConversations.length === 0 ? (
    <Animated.ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={tailwind.style(
        'flex-1 items-center justify-center',
        `pb-[${TAB_BAR_HEIGHT}px]`,
      )}>
      <EmptyStateIcon />
      <Animated.Text style={tailwind.style('pt-6 text-md  tracking-[0.32px] text-gray-800')}>
        {i18n.t('CONVERSATION.EMPTY')}
      </Animated.Text>
    </Animated.ScrollView>
  ) : (
    <AnimatedFlashList
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      layout={LinearTransition.springify().damping(18).stiffness(120)}
      showsVerticalScrollIndicator={false}
      data={allConversations}
      estimatedItemSize={91}
      onScroll={scrollHandler}
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      renderItem={handleRender}
      contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
    />
  );
};

const ConversationScreen = () => {
  const currentBottomSheet = useAppSelector(selectBottomSheetState);
  const dispatch = useAppDispatch();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const currentActionState = useAppSelector(selectCurrentActionState);
  const { filtersModalSheetRef, actionsModalSheetRef } = useRefsContext();
  // const { bottom } = useSafeAreaInsets();

  const handleOnDismiss = () => {
    /**
     * Resetting the bottoms sheet state to none with a timeout
     * to avoid flickering of bottom sheet
     */
    dispatch(setBottomSheetState('none'));
    dispatch(resetActionState());
  };

  const filterSnapPoints = useMemo(() => {
    switch (currentBottomSheet) {
      case 'status':
        return [290];
      case 'sort_by':
        return [200];
      case 'assignee_type':
        return [200];
      case 'inbox_id':
        return ['70%'];
      default:
        return [250];
    }
  }, [currentBottomSheet]);

  const actionSnapPoints = useMemo(() => {
    switch (currentActionState) {
      case 'Assign':
        return [368];
      case 'Status':
        return [250];
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
        <ConversationHeader />
        <ConversationList />
        <BottomSheetModal
          ref={filtersModalSheetRef}
          backdropComponent={BottomSheetBackdrop}
          handleIndicatorStyle={tailwind.style(
            'overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]',
          )}
          handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
          style={tailwind.style('rounded-[26px] overflow-hidden')}
          animationConfigs={animationConfigs}
          enablePanDownToClose
          snapPoints={filterSnapPoints}
          onDismiss={handleOnDismiss}>
          <BottomSheetWrapper>
            {currentBottomSheet === 'status' ? <StatusListSheet type="Filter" /> : null}
            {currentBottomSheet === 'sort_by' ? <SortBySheet /> : null}
            {currentBottomSheet === 'assignee_type' ? <AssigneeTypeSheet /> : null}
            {currentBottomSheet === 'inbox_id' ? <InboxListSheet /> : null}
          </BottomSheetWrapper>
        </BottomSheetModal>
        <BottomSheetModal
          ref={actionsModalSheetRef}
          backdropComponent={BottomSheetBackdrop}
          handleIndicatorStyle={tailwind.style(
            'overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]',
          )}
          handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
          style={tailwind.style('rounded-[26px] overflow-hidden')}
          animationConfigs={animationConfigs}
          enablePanDownToClose
          snapPoints={actionSnapPoints}
          onDismiss={handleOnDismiss}>
          {currentActionState === 'Assign' ? <AssigneeListSheet /> : null}
          {currentActionState === 'Status' ? <StatusListSheet type="SetStatus" /> : null}
          {currentActionState === 'Label' ? <LabelListSheet /> : null}
        </BottomSheetModal>
        <ActionTabs />
      </ConversationListStateProvider>
    </SafeAreaView>
  );
};

export default ConversationScreen;
