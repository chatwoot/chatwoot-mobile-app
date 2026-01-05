import {
  BottomSheetModal,
  useBottomSheetModal,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, RefreshControl, StatusBar } from 'react-native';
import Animated, {
  LinearTransition,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AssigneeTypeFilters,
  ConversationHeader,
  ConversationItemContainer,
  InboxFilters,
  SortByFilters,
  StatusFilters,
} from './components';

import { ActionTabs, BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';

import {
  LAST_ACTIVE_TIMESTAMP_KEY,
  LAST_ACTIVE_TIMESTAMP_THRESHOLD,
  SCREENS,
  TAB_BAR_HEIGHT,
} from '@/constants';
import {
  ConversationListStateProvider,
  useConversationListStateContext,
  useRefsContext,
} from '@/context';
import { EmptyStateIcon } from '@/svg-icons';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { clearAssignableAgents } from '@/store/assignable-agent/assignableAgentSlice';
import { selectUserId } from '@/store/auth/authSelectors';
import { clearAllContacts } from '@/store/contact/contactSlice';
import { resetActionState } from '@/store/conversation/conversationActionSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { FilterState, selectFilters } from '@/store/conversation/conversationFilterSlice';
import {
  selectBottomSheetState,
  setBottomSheetState,
} from '@/store/conversation/conversationHeaderSlice';
import {
  getFilteredConversations,
  selectConversationsLoading,
  selectIsAllConversationsFetched,
} from '@/store/conversation/conversationSelectors';
import { clearAllConversations } from '@/store/conversation/conversationSlice';
import { ConversationPayload } from '@/store/conversation/conversationTypes';
import { tailwind } from '@/theme';
import { Conversation } from '@/types';

import { TokenRequiredMessage } from '@/components-next/token-required/TokenRequiredMessage';
import i18n from '@/i18n';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';
import { getCurrentRouteName } from '@/utils/navigationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The screen list thats need to be checked for refreshing the conversations list
const REFRESH_SCREEN_LIST = [SCREENS.CONVERSATION, SCREENS.INBOX, SCREENS.SETTINGS];

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

type FlashListRenderItemType = {
  item: Conversation;
  index: number;
};

const ConversationList = () => {
  const { dismissAll } = useBottomSheetModal();
  const dispatch = useAppDispatch();
  const [appState, setAppState] = useState(AppState.currentState);

  // This is used to prevent the infinite scrolling before the list is ready
  const [isFlashListReady, setFlashListReady] = useState(false);
  // This is used for pull to refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  // This is used for pagination
  const [pageNumber, setPageNumber] = useState(1);
  const userId = useAppSelector(selectUserId);

  // This is used to store the index of the item that is currently selected
  const { openedRowIndex } = useConversationListStateContext();

  // This is used to check if the conversations are still loading
  const isConversationsLoading = useAppSelector(selectConversationsLoading);
  // This is used to check if all the conversations are fetched
  const isAllConversationsFetched = useAppSelector(selectIsAllConversationsFetched);
  const isTokenValid = useAppSelector(state => state.settings.isTokenValid);

  const handleRender = useCallback(({ item, index }: FlashListRenderItemType) => {
    return (
      <ConversationItemContainer
        index={index}
        conversationItem={item}
        openedRowIndex={openedRowIndex as SharedValue<number | null>}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters = useAppSelector(selectFilters);
  const previousFilters = useRef(filters);

  // Reset last active timestamp when the conversation screen is opened
  useEffect(() => {
    AsyncStorage.removeItem(LAST_ACTIVE_TIMESTAMP_KEY);
  }, []);

  useEffect(() => {
    if (previousFilters.current !== filters) {
      previousFilters.current = filters;
      clearAndFetchConversations(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    dismissAll();
    // Só buscar conversas se token for válido
    if (isTokenValid) {
      clearAndFetchConversations(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Adicionar verificação de isTokenValid

  const clearAndFetchConversations = useCallback(
    async (filters: FilterState) => {
      // Não buscar conversas se token não for válido
      if (!isTokenValid) {
        return;
      }

      setPageNumber(1);
      await dispatch(clearAllConversations());
      await dispatch(clearAllContacts());
      await dispatch(clearAssignableAgents());
      fetchConversations(filters);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, isTokenValid], // Adicionar isTokenValid como dependência
  );

  const ListFooterComponent = () => {
    if (isAllConversationsFetched) return null;
    return (
      <Animated.View
        style={tailwind.style(
          'flex-1 items-center justify-center pt-8',
          `pb-[${TAB_BAR_HEIGHT}px]`,
        )}>
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

  const checkAppStateAndFetchConversations = useCallback(async () => {
    const lastActiveTimestamp = await AsyncStorage.getItem(LAST_ACTIVE_TIMESTAMP_KEY);
    if (lastActiveTimestamp) {
      const currentTimestamp = Date.now();
      const difference = currentTimestamp - parseInt(lastActiveTimestamp);
      if (difference > LAST_ACTIVE_TIMESTAMP_THRESHOLD) {
        clearAndFetchConversations(filters);
      }
    }
  }, [clearAndFetchConversations, filters]);

  // Update conversations when app comes to foreground from background
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const routeName = getCurrentRouteName();
        if (routeName && REFRESH_SCREEN_LIST.includes(routeName)) {
          checkAppStateAndFetchConversations();
        }
      }

      if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        // App is going to background
        const currentTimestamp = Date.now();
        AsyncStorage.setItem(LAST_ACTIVE_TIMESTAMP_KEY, currentTimestamp.toString());
      }

      setAppState(nextAppState);
    });
    return () => {
      appStateListener?.remove();
    };
  }, [appState, checkAppStateAndFetchConversations, clearAndFetchConversations, filters]);

  const fetchConversations = useCallback(
    async (filters: FilterState, page: number = 1) => {
      // Não buscar conversas se token não for válido
      if (!isTokenValid) {
        return;
      }

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
    [isTokenValid], // Adicionar isTokenValid como dependência
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

  // Se token não for válido, mostrar mensagem em vez das conversas
  if (!isTokenValid) {
    return <TokenRequiredMessage />;
  }

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
    mass: 1.2,
    stiffness: 300,
    damping: 50,
  });

  const { filtersModalSheetRef } = useRefsContext();

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
            {currentBottomSheet === 'status' ? <StatusFilters /> : null}
            {currentBottomSheet === 'sort_by' ? <SortByFilters /> : null}
            {currentBottomSheet === 'assignee_type' ? <AssigneeTypeFilters /> : null}
            {currentBottomSheet === 'inbox_id' ? <InboxFilters /> : null}
          </BottomSheetWrapper>
        </BottomSheetModal>
        <ActionBottomSheet />
        <ActionTabs />
      </ConversationListStateProvider>
    </SafeAreaView>
  );
};

export default ConversationScreen;
