import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import Animated, {
  LinearTransition,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList, ListRenderItem } from '@shopify/flash-list';

import { TAB_BAR_HEIGHT } from '@/constants';
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
import i18n from '@/i18n';
import { selectSortOrder, selectFilters, FilterState } from '@/store/notification/notificationFilterSlice'; // Adicionado selectFilters e FilterState
import { EmptyStateIcon } from '@/svg-icons';
import { InboxSortTypes } from '@/store/notification/notificationTypes';

const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList<Notification>);

const InboxList = () => {
  const [pageNumber, setPageNumber] = useState(1);

  const [isFlashListReady, setFlashListReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isNotificationsLoading = useAppSelector(selectIsLoadingNotifications);
  const isAllNotificationsFetched = useAppSelector(selectIsAllNotificationsFetched);
  const filters = useAppSelector(selectFilters); // Obter filters completos

  const notifications = useAppSelector(state => getFilteredNotifications(state, filters)); // Passar filters

  const previousFilters = useRef(filters); // Alterado para filters

  const dispatch = useAppDispatch();

  // This useEffect is used to re-fetch the notifications whenever the filters change.
  // The previousFilters ref is used to prevent an infinite loop.
  useEffect(() => {
    if (previousFilters.current !== filters) { // Comparar filters
      previousFilters.current = filters;
      clearAndFetchNotifications(filters); // Passar filters
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Depender de filters

  // eslint-disable-next-line react/display-name
  const ListFooterComponent = React.memo(() => {
    if (isAllNotificationsFetched) return null;
    return (
      <Animated.View
        style={tailwind.style(
          'flex-1 items-center justify-center pt-8',
          `pb-[${TAB_BAR_HEIGHT}px]`,
        )}>
        {isAllNotificationsFetched ? null : <ActivityIndicator size="small" />}
      </Animated.View>
    );
  });

  useEffect(() => {
    clearAndFetchNotifications(filters); // Passar filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAndFetchNotifications = useCallback(async (filters: FilterState) => { // Tipagem para filters
    setPageNumber(1);
    await dispatch(resetNotifications());
    fetchNotifications(filters); // Passar filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = useCallback(
    async (filters: FilterState, page: number = 1) => { // Tipagem para filters
      dispatch(notificationActions.fetchNotifications({ page, sort_order: filters.sortOrder })); // Usar filters.sortOrder
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onChangePageNumber = () => {
    const nextPageNumber = pageNumber + 1;
    setPageNumber(nextPageNumber);
    fetchNotifications(filters, nextPageNumber); // Passar filters
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
    clearAndFetchNotifications(filters).finally(() => { // Passar filters
      setIsRefreshing(false);
    });
  }, [clearAndFetchNotifications, filters]); // Depender de filters

  const { openedRowIndex } = useInboxListStateContext();

  const handleRender: ListRenderItem<Notification> = ({ item, index }) => {
    return (
      <InboxItemContainer
        item={item}
        index={index}
        openedRowIndex={openedRowIndex as SharedValue<number | null>}
      />
    );
  };

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      openedRowIndex.value = -1;
      if (!isFlashListReady) {
        runOnJS(setFlashListReady)(true);
      }
    },
  });

  const shouldShowEmptyLoader = isNotificationsLoading && notifications.length === 0;

  return shouldShowEmptyLoader ? (
    <Animated.View
      style={tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`)}>
      <ActivityIndicator />
    </Animated.View>
  ) : notifications.length === 0 ? (
    <Animated.ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={tailwind.style(
        'flex-1 items-center justify-center',
        `pb-[${TAB_BAR_HEIGHT}px]`,
      )}>
      <EmptyStateIcon />
      <Animated.Text style={tailwind.style('pt-6 text-md tracking-[0.32px] text-gray-800')}>
        {i18n.t('NOTIFICATION.EMPTY')}
      </Animated.Text>
    </Animated.ScrollView>
  ) : (
    <AnimatedFlashlist
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      layout={LinearTransition.springify().damping(18).stiffness(120)}
      showsVerticalScrollIndicator={false}
      data={notifications}
      estimatedItemSize={71}
      onScroll={scrollHandler}
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent}
      renderItem={handleRender}
      contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
    />
  );
};

const InboxScreen = () => {
  const dispatch = useAppDispatch();

  // Memoize the markAllAsRead callback
  const markAllAsRead = useCallback(async () => {
    await dispatch(notificationActions.markAllAsRead());
    showToast({
      message: i18n.t('NOTIFICATION.ALERTS.MARK_ALL_READ'),
    });
  }, [dispatch]);

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <InboxListStateProvider>
        <InboxHeader markAllAsRead={markAllAsRead} />
        <InboxList />
      </InboxListStateProvider>
    </SafeAreaView>
  );
};

export default InboxScreen;
