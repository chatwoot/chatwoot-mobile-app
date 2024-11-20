import React, { useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import Animated, { LinearTransition, useAnimatedScrollHandler } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import { TAB_BAR_HEIGHT } from '@/constants';
import { InboxListStateProvider, useInboxListStateContext } from '@/context';
import type { Notification } from '@/types/Notification';
import { tailwind } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { notificationActions } from '@/store/notification/notificationAction';
import { selectAllNotifications } from '@/store/notification/notificationSelectors';
import { InboxItem, InboxHeader, InboxEmpty } from './components';

const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList);

type FlashListRenderItemType = {
  item: Notification;
  index: number;
};

// const ListFooterComponent = () => (
//   <Animated.View style={tailwind.style('h-20 flex justify-center items-center')}>
//     <ActivityIndicator />
//   </Animated.View>
// );

const InboxList = () => {
  const notifications = useAppSelector(selectAllNotifications);

  const { openedRowIndex } = useInboxListStateContext();
  const handleRender = useCallback(({ item, index }: FlashListRenderItemType) => {
    return <InboxItem item={item} index={index} />;
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      openedRowIndex.value = -1;
    },
  });

  if (notifications.length === 0) {
    return <InboxEmpty />;
  }

  return (
    <AnimatedFlashlist
      layout={LinearTransition.springify().damping(18).stiffness(120)}
      showsVerticalScrollIndicator={false}
      data={notifications}
      scrollEventThrottle={16}
      estimatedItemSize={71}
      onScroll={scrollHandler}
      // ListFooterComponent={true ? ListFooterComponent : null}
      // @ts-ignore
      renderItem={handleRender}
      contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
    />
  );
};

const InboxScreen = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      notificationActions.fetchNotifications({
        page: 1,
        sortOrder: 'desc',
        status: 'snoozed',
        type: 'read',
      }),
    );
  }, [dispatch]);

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <InboxListStateProvider>
        <InboxHeader />
        <InboxList />
      </InboxListStateProvider>
    </SafeAreaView>
  );
};

export default InboxScreen;
