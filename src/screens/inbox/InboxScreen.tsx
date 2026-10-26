import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SplitView } from '@/navigation/split/SplitView';
import { SplitEmptyState } from '@/navigation/split/SplitEmptyState';
import {
  HeaderSpacer,
  PullToRefreshIndicator,
  ScrollEdgeHeader,
  useScrollEdge,
} from '@/components-next/side-toolbar';
import { FlashList, ListRenderItem } from '@shopify/flash-list';

import { InboxListStateProvider } from '@/context';
import type { Notification } from '@/types/Notification';
import { tailwind } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { notificationActions } from '@/store/notification/notificationAction';
import {
  selectIsAllNotificationsFetched,
  selectIsLoadingNotifications,
  getFilteredNotifications,
} from '@/store/notification/notificationSelectors';
import { InboxHeader, InboxItemContainer } from './components';
import { useInboxListStateContext } from '@/context';
import { resetNotifications } from '@/store/notification/notificationSlice';
import { showToast } from '@/utils/toastUtils';
import { useTabBarHeight, useIsSplitLayout, useSideTabBarLayout } from '@/utils';
import i18n from '@/i18n';
import { selectSortOrder } from '@/store/notification/notificationFilterSlice';
import { selectCurrentUserAccountId } from '@/store/auth/authSelectors';
import { EmptyStateIcon, NotificationPaneEmptyIcon } from '@/svg-icons';
import { InboxSortTypes } from '@/store/notification/notificationTypes';

const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList<Notification>);

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
const InboxList = ({
  overlayHeaderHeight = 0,
  splitEmpty = false,
  onScroll,
  scrollY,
  isDragging,
}: OverlayListProps) => {
  const tabBarHeight = useTabBarHeight();
  const [pageNumber, setPageNumber] = useState(1);

  const [isFlashListReady, setFlashListReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isNotificationsLoading = useAppSelector(selectIsLoadingNotifications);
  const isAllNotificationsFetched = useAppSelector(selectIsAllNotificationsFetched);
  const sortOrder = useAppSelector(selectSortOrder);
  const accountId = useAppSelector(selectCurrentUserAccountId);

  const notifications = useAppSelector(state => getFilteredNotifications(state, sortOrder));

  const previousSortOrder = useRef(sortOrder);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (previousSortOrder.current !== sortOrder) {
      previousSortOrder.current = sortOrder;
      clearAndFetchNotifications(sortOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  // eslint-disable-next-line react/display-name
  const ListFooterComponent = React.memo(() => {
    if (isAllNotificationsFetched || !isFlashListReady) return null;
    return (
      <Animated.View
        style={tailwind.style('flex-1 items-center justify-center pt-8', `pb-[${tabBarHeight}px]`)}>
        <ActivityIndicator size="small" />
      </Animated.View>
    );
  });

  // Refetch when the active account changes.
  useEffect(() => {
    clearAndFetchNotifications(sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const clearAndFetchNotifications = useCallback(async (sortOrder: InboxSortTypes) => {
    setPageNumber(1);
    await dispatch(resetNotifications());
    fetchNotifications(sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = useCallback(
    async (sortOrder: InboxSortTypes, page: number = 1) => {
      dispatch(notificationActions.fetchNotifications({ page, sort_order: sortOrder }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onChangePageNumber = () => {
    const nextPageNumber = pageNumber + 1;
    setPageNumber(nextPageNumber);
    fetchNotifications(sortOrder, nextPageNumber);
  };

  const handleOnEndReached = () => {
    const shouldLoadMoreConversations =
      isFlashListReady && !isAllNotificationsFetched && !isNotificationsLoading;
    if (shouldLoadMoreConversations) {
      onChangePageNumber();
    }
  };

  const handleRefresh = useCallback(() => {
    setFlashListReady(false);
    setIsRefreshing(true);
    clearAndFetchNotifications(sortOrder).finally(() => {
      setIsRefreshing(false);
    });
  }, [clearAndFetchNotifications, sortOrder]);

  const { openedRowIndex } = useInboxListStateContext();

  const handleRender: ListRenderItem<Notification> = ({ item, index }) => {
    return (
      <InboxItemContainer
        item={item}
        index={index}
        nextConversationId={notifications[index + 1]?.primaryActor?.id}
        openedRowIndex={openedRowIndex as SharedValue<number | null>}
      />
    );
  };

  const handleScrollBeginDrag = useCallback(() => {
    openedRowIndex.value = -1;
    if (!isFlashListReady) {
      setFlashListReady(true);
    }
  }, [isFlashListReady, openedRowIndex]);

  const shouldShowEmptyLoader = isNotificationsLoading && notifications.length === 0;

  return shouldShowEmptyLoader ? (
    <Animated.View
      style={tailwind.style('flex-1 items-center justify-center', `pb-[${tabBarHeight}px]`)}>
      <ActivityIndicator />
    </Animated.View>
  ) : notifications.length === 0 ? (
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
          <SplitEmptyState message={i18n.t('NOTIFICATION.EMPTY')} />
        ) : (
          <>
            <EmptyStateIcon />
            <Animated.Text style={tailwind.style('pt-6 text-md tracking-[0.32px] text-gray-800')}>
              {i18n.t('NOTIFICATION.EMPTY')}
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
      <AnimatedFlashlist
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
        data={notifications}
        onScrollBeginDrag={handleScrollBeginDrag}
        onEndReached={handleOnEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
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

const InboxScreen = () => {
  const isSplit = useIsSplitLayout();
  const [headerHeight, setHeaderHeight] = useState(0);
  const isSideLayout = useSideTabBarLayout() !== null;
  const scrollEdge = useScrollEdge();
  const sortOrder = useAppSelector(selectSortOrder);
  const dispatch = useAppDispatch();

  // Memoize the markAllAsRead callback
  const markAllAsRead = useCallback(async () => {
    await dispatch(notificationActions.markAllAsRead());
    showToast({
      message: i18n.t('NOTIFICATION.ALERTS.MARK_ALL_READ'),
    });
  }, [dispatch]);

  return (
    <SplitView
      resetKey={sortOrder}
      emptyIcon={<NotificationPaneEmptyIcon />}
      emptyMessage={i18n.t('NOTIFICATION.SPLIT_VIEW_EMPTY')}>
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
        <InboxListStateProvider>
          {isSideLayout ? (
            // Header floats over the list with a scroll edge effect (iPhone Duo).
            <>
              <Animated.View style={tailwind.style('flex-1')}>
                {/* Wait for the header's height so the list opens at the right offset. */}
                {headerHeight ? (
                  <InboxList
                    overlayHeaderHeight={headerHeight}
                    splitEmpty={isSplit}
                    onScroll={scrollEdge.onScroll}
                    scrollY={scrollEdge.scrollY}
                    isDragging={scrollEdge.isDragging}
                  />
                ) : null}
              </Animated.View>
              <ScrollEdgeHeader scrollY={scrollEdge.scrollY} onHeightChange={setHeaderHeight}>
                <InboxHeader markAllAsRead={markAllAsRead} />
              </ScrollEdgeHeader>
            </>
          ) : (
            <>
              <InboxHeader markAllAsRead={markAllAsRead} />
              <InboxList />
            </>
          )}
        </InboxListStateProvider>
      </SafeAreaView>
    </SplitView>
  );
};

export default InboxScreen;
