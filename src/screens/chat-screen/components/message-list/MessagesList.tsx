import { useTailwind } from '@/theme/useTailwind';
import React from 'react';

import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSlaPillVisibility } from '../../SlaPillVisibility';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useAppKeyboardAnimation } from '@/utils';
import { Message } from '@/types';
import { MessageComponent } from '../message-item/Message';
import { useRefsContext } from '@/context';
import { useAutoScrollToNewest } from './useAutoScrollToNewest';

export type FlashListRenderProps = {
  item: { date: string } | Message;
  index: number;
};

const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList<Message | { date: string }>);

type DateSectionProps = { item: { date: string } };

const DateSection = ({ item }: DateSectionProps) => {
  const tailwind = useTailwind();
  return (
    <Animated.View style={tailwind.style('flex flex-row justify-center items-center py-4')}>
      <Animated.View style={tailwind.style('rounded-lg py-1 px-[7px] bg-blackA-A3')}>
        <Animated.Text
          style={tailwind.style(
            'text-cxs font-inter-420-20 tracking-[0.32px] text-blackA-A11 leading-[15px]',
          )}>
          {item.date}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

type MessagesListPresentationProps = {
  messages: (Message | { date: string })[];
  isFlashListReady: boolean;
  setFlashListReady: (ready: boolean) => void;
  onEndReached: () => void;
  onStartReached: () => void;
  isEmailInbox: boolean;
  currentUserId: number;
  isSearchNavigation?: boolean;
  highlightedMessageId?: number;
};

export const MessagesList = ({
  messages,
  isFlashListReady,
  setFlashListReady,
  onEndReached,
  onStartReached,
  isEmailInbox,
  currentUserId,
  isSearchNavigation = false,
  highlightedMessageId,
}: MessagesListPresentationProps) => {
  const tailwind = useTailwind();
  const { progress, height } = useAppKeyboardAnimation();
  const { messageListRef } = useRefsContext();
  const slaPill = useSlaPillVisibility();
  const scrollY = useSharedValue(0);
  const isPillShown = useSharedValue(1);
  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
      if (!slaPill) return;
      const shouldShow = event.contentOffset.y < 8 ? 1 : 0;
      if (shouldShow === isPillShown.value) return;
      isPillShown.value = shouldShow;
      slaPill.value = withTiming(shouldShow, { duration: 180 });
    },
  });
  const typedMessageListRef = messageListRef as React.RefObject<
    FlashListRef<Message | { date: string }>
  >;

  useAutoScrollToNewest({
    messages,
    currentUserId,
    messageListRef: typedMessageListRef,
    scrollY,
    isSearchNavigation,
  });

  const handleRender = ({ item, index }: { item: Message | { date: string }; index: number }) => {
    if ('date' in item) {
      return <DateSection item={item} />;
    }

    const isTarget = highlightedMessageId !== undefined && highlightedMessageId === item.id;

    return (
      <MessageComponent
        item={item}
        index={index}
        isEmailInbox={isEmailInbox}
        currentUserId={currentUserId}
        isTargetMessage={isTarget}
      />
    );
  };

  const animatedFlashlistStyle = useAnimatedStyle(() => {
    return {
      marginBottom: withSpring(interpolate(progress.value, [0, 1], [0, height.value]), {
        stiffness: 240,
        damping: 38,
      }),
    };
  });

  return (
    <Animated.View style={[tailwind.style('flex-1 min-h-10'), animatedFlashlistStyle]}>
      <AnimatedFlashlist
        onLoad={() => {
          // Search navigation positions once items are drawn (measured), so
          // scroll-to-target lands accurately.
          if (isSearchNavigation && !isFlashListReady) {
            setFlashListReady(true);
          }
        }}
        onScrollBeginDrag={() => {
          // Normal chat becomes ready on the first user drag, which gates pagination.
          if (!isSearchNavigation && !isFlashListReady) {
            setFlashListReady(true);
          }
        }}
        ref={typedMessageListRef}
        // Data is newest-first, so inverted renders index 0 at the visual bottom.
        // Older history loads via onEndReached, newer via onStartReached.
        inverted
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemType={item => ('date' in item ? 'date' : 'message')}
        drawDistance={500}
        showsVerticalScrollIndicator={false}
        renderItem={handleRender}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
        onStartReached={onStartReached}
        onStartReachedThreshold={0.1}
        data={messages}
        contentContainerStyle={tailwind.style('px-3')}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item: { date: string } | Message) => {
          if ('date' in item) {
            return item.date.toString();
          }
          return item.id.toString();
        }}
      />
    </Animated.View>
  );
};
