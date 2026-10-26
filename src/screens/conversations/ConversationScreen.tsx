import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, RefreshControl, StatusBar } from 'react-native';
import Animated, { LinearTransition, SharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SplitView } from '@/navigation/split/SplitView';
import { SplitEmptyState } from '@/navigation/split/SplitEmptyState';
import {
  HeaderSpacer,
  PullToRefreshIndicator,
  ScrollEdgeHeader,
  useScrollEdge,
} from '@/components-next/side-toolbar';
import { FlashList } from '@shopify/flash-list';

import {
  ConversationItemContainer,
  ConversationHeader,
  StatusFilters,
  SortByFilters,
  InboxFilters,
  AssigneeTypeFilters,
} from './components';

import { ActionTabs } from '@/components-next';
import { Sheet } from '@/components-next/common/sheet/Sheet';

import { EmptyStateIcon } from '@/svg-icons';
import { SCREENS, LAST_ACTIVE_TIMESTAMP_KEY, LAST_ACTIVE_TIMESTAMP_THRESHOLD } from '@/constants';
import {
  ConversationListStateProvider,
  useConversationListStateContext,
  useRefsContext,
} from '@/context';

import { tailwind } from '@/theme';
import { Conversation } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectBottomSheetState,
  setBottomSheetState,
} from '@/store/conversation/conversationHeaderSlice';
import { resetActionState } from '@/store/conversation/conversationActionSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import {
  selectConversationsLoading,
  selectIsAllConversationsFetched,
  getFilteredConversations,
} from '@/store/conversation/conversationSelectors';
import { selectFilters, FilterState } from '@/store/conversation/conversationFilterSlice';
import { ConversationPayload } from '@/store/conversation/conversationTypes';
import { clearAllConversations } from '@/store/conversation/conversationSlice';
import { selectUserId, selectCurrentUserAccountId } from '@/store/auth/authSelectors';
import { clearAllContacts } from '@/store/contact/contactSlice';
import { clearAssignableAgents } from '@/store/assignable-agent/assignableAgentSlice';

import i18n from '@/i18n';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';
import { getCurrentRouteName } from '@/utils/navigationUtils';
import { IOS_DESIGN, useTabBarHeight, useIsSplitLayout, useSideTabBarLayout } from '@/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The screen list thats need to be checked for refreshing the conversations list
const REFRESH_SCREEN_LIST = [SCREENS.CONVERSATION, SCREENS.INBOX, SCREENS.SETTINGS];

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

type FlashListRenderItemType = {
  item: Conversation;
  index: number;
};

// With tabs on the side (iPhone Duo) the header floats over the list with a scroll edge
// effect: `overlayHeaderHeight` adds a spacer so the rows start below the header and
// offsets the refresh spinner to match, and `onScroll` drives the effect. `splitEmpty` uses
// the split view's empty state.
type OverlayListProps = {
  overlayHeaderHeight?: number;
  splitEmpty?: boolean;
  // Drives the pull-to-refresh spinner drawn below the floating header.
  scrollY?: SharedValue<number>;
  isDragging?: SharedValue<number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onScroll?: any;
};
const ConversationList = ({
  overlayHeaderHeight = 0,
  splitEmpty = false,
  onScroll,
  scrollY,
  isDragging,
}: OverlayListProps) => {
  const dispatch = useAppDispatch();
  const tabBarHeight = useTabBarHeight();
  const [appState, setAppState] = useState(AppState.currentState);

  // This is used to prevent the infinite scrolling before the list is ready
  const [isFlashListReady, setFlashListReady] = useState(false);
  // This is used for pull to refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  // This is used for pagination
  const [pageNumber, setPageNumber] = useState(1);
  const userId = useAppSelector(selectUserId);
  const accountId = useAppSelector(selectCurrentUserAccountId);

  // This is used to store the index of the item that is currently selected
  const { openedRowIndex } = useConversationListStateContext();

  // This is used to check if the conversations are still loading
  const isConversationsLoading = useAppSelector(selectConversationsLoading);
  // This is used to check if all the conversations are fetched
  const isAllConversationsFetched = useAppSelector(selectIsAllConversationsFetched);

  const filters = useAppSelector(selectFilters);

  const allConversations = useAppSelector(state =>
    getFilteredConversations(state, filters, userId),
  );

  const handleRender = useCallback(
    ({ item, index }: FlashListRenderItemType) => {
      return (
        <ConversationItemContainer
          index={index}
          conversationItem={item}
          nextConversationId={allConversations[index + 1]?.id}
          openedRowIndex={openedRowIndex as SharedValue<number | null>}
        />
      );
    },
    [allConversations, openedRowIndex],
  );

  // Reset last active timestamp when the conversation screen is opened
  useEffect(() => {
    AsyncStorage.removeItem(LAST_ACTIVE_TIMESTAMP_KEY);
  }, []);

  // Fetch on mount and whenever the account or filters change (single effect so a
  // switch that also resets filters doesn't fire two fetches).
  useEffect(() => {
    clearAndFetchConversations(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, filters]);

  const clearAndFetchConversations = useCallback(async (filters: FilterState) => {
    setPageNumber(1);
    await dispatch(clearAllConversations());
    await dispatch(clearAllContacts());
    await dispatch(clearAssignableAgents());
    fetchConversations(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ListFooterComponent = () => {
    if (isAllConversationsFetched || !isFlashListReady) return null;
    return (
      <Animated.View
        style={tailwind.style('flex-1 items-center justify-center pt-8', `pb-[${tabBarHeight}px]`)}>
        <ActivityIndicator size="small" />
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

  const handleScrollBeginDrag = useCallback(() => {
    openedRowIndex.value = -1;
    if (!isFlashListReady) {
      setFlashListReady(true);
    }
  }, [isFlashListReady, openedRowIndex]);

  const shouldShowEmptyLoader = isConversationsLoading && allConversations.length === 0;

  return shouldShowEmptyLoader ? (
    <Animated.View
      style={tailwind.style('flex-1 items-center justify-center', `pb-[${tabBarHeight}px]`)}>
      <ActivityIndicator />
    </Animated.View>
  ) : allConversations.length === 0 ? (
    <Animated.View style={tailwind.style('flex-1')}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            // Under the floating header the spinner is drawn by PullToRefreshIndicator.
            tintColor={overlayHeaderHeight ? 'transparent' : undefined}
          />
        }
        contentContainerStyle={tailwind.style(
          'flex-1 items-center justify-center',
          `pb-[${tabBarHeight}px]`,
        )}>
        {splitEmpty ? (
          <SplitEmptyState message={i18n.t('CONVERSATION.EMPTY')} />
        ) : (
          <>
            <EmptyStateIcon />
            <Animated.Text style={tailwind.style('pt-6 text-md  tracking-[0.32px] text-gray-800')}>
              {i18n.t('CONVERSATION.EMPTY')}
            </Animated.Text>
          </>
        )}
      </Animated.ScrollView>
      {overlayHeaderHeight && scrollY && isDragging ? (
        <PullToRefreshIndicator
          scrollY={scrollY}
          isDragging={isDragging}
          top={overlayHeaderHeight}
          refreshing={isRefreshing}
        />
      ) : null}
    </Animated.View>
  ) : (
    <Animated.View style={tailwind.style('flex-1')}>
      <AnimatedFlashList
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            // Under the floating header the spinner is drawn by PullToRefreshIndicator.
            tintColor={overlayHeaderHeight ? 'transparent' : undefined}
          />
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        // Start below the floating header: a spacer the header's height sits above the rows.
        ListHeaderComponent={
          overlayHeaderHeight ? <HeaderSpacer height={overlayHeaderHeight} /> : null
        }
        scrollIndicatorInsets={overlayHeaderHeight ? { top: overlayHeaderHeight } : undefined}
        showsVerticalScrollIndicator={false}
        data={allConversations}
        onScrollBeginDrag={handleScrollBeginDrag}
        onEndReached={handleOnEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        renderItem={handleRender}
        contentContainerStyle={tailwind.style(`pb-[${tabBarHeight - 1}px]`)}
      />
      {overlayHeaderHeight && scrollY && isDragging ? (
        <PullToRefreshIndicator
          scrollY={scrollY}
          isDragging={isDragging}
          top={overlayHeaderHeight}
          refreshing={isRefreshing}
        />
      ) : null}
    </Animated.View>
  );
};

const ConversationScreen = () => {
  const isSplit = useIsSplitLayout();
  const [headerHeight, setHeaderHeight] = useState(0);
  // The header floats over the list on iOS (and with tabs on the side).
  const sideTabBar = useSideTabBarLayout();
  const hasOverlayHeader = IOS_DESIGN || sideTabBar !== null;
  const scrollEdge = useScrollEdge();
  const filters = useAppSelector(selectFilters);
  const currentBottomSheet = useAppSelector(selectBottomSheetState);
  const dispatch = useAppDispatch();

  const { filtersModalSheetRef } = useRefsContext();

  const handleOnDismiss = () => {
    /**
     * Resetting the bottoms sheet state to none with a timeout
     * to avoid flickering of bottom sheet
     */
    dispatch(setBottomSheetState('none'));
    dispatch(resetActionState());
  };

  const isInbox = currentBottomSheet === 'inbox_id';

  const filterHeight = (() => {
    switch (currentBottomSheet) {
      case 'status':
        return 290;
      case 'sort_by':
        return 200;
      case 'assignee_type':
        return 200;
      default:
        return 250;
    }
  })();

  return (
    <SplitView resetKey={filters}>
      {/* In the split view the list ends at the divider, not the screen edge, so it
          skips the right inset (SafeAreaView applies screen insets regardless of position). */}
      <SafeAreaView
        edges={isSplit ? ['top', 'left'] : ['top', 'left', 'right']}
        style={tailwind.style('flex-1 bg-white')}>
        <StatusBar
          translucent
          backgroundColor={tailwind.color('bg-white')}
          barStyle={'dark-content'}
        />
        <ConversationListStateProvider>
          {hasOverlayHeader ? (
            // Header floats over the list with a scroll edge effect (Apple HIG, Scroll views).
            <>
              <Animated.View style={tailwind.style('flex-1')}>
                {/* Wait for the header's height so the list opens at the right offset. */}
                {headerHeight ? (
                  <ConversationList
                    overlayHeaderHeight={headerHeight}
                    splitEmpty={isSplit}
                    onScroll={scrollEdge.onScroll}
                    scrollY={scrollEdge.scrollY}
                    isDragging={scrollEdge.isDragging}
                  />
                ) : null}
              </Animated.View>
              <ScrollEdgeHeader scrollY={scrollEdge.scrollY} onHeightChange={setHeaderHeight}>
                <ConversationHeader />
              </ScrollEdgeHeader>
            </>
          ) : (
            <>
              <ConversationHeader />
              <Animated.View
                style={tailwind.style('flex-1')}
                layout={LinearTransition.springify().damping(22).stiffness(180)}>
                <ConversationList />
              </Animated.View>
            </>
          )}
          <Sheet
            ref={filtersModalSheetRef}
            height={isInbox ? undefined : filterHeight}
            detents={isInbox ? [0.7] : undefined}
            scrollable={isInbox}
            onDismiss={handleOnDismiss}>
            {isInbox ? (
              <InboxFilters />
            ) : (
              <>
                {currentBottomSheet === 'status' ? <StatusFilters /> : null}
                {currentBottomSheet === 'sort_by' ? <SortByFilters /> : null}
                {currentBottomSheet === 'assignee_type' ? <AssigneeTypeFilters /> : null}
              </>
            )}
          </Sheet>
          <ActionBottomSheet />
          <ActionTabs />
        </ConversationListStateProvider>
      </SafeAreaView>
    </SplitView>
  );
};

export default ConversationScreen;
