import React, { useEffect, useRef } from 'react';

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
import { tailwind } from '@/theme';
import { Message } from '@/types';
import { MessageComponent } from '../message-item/Message';
import { useRefsContext } from '@/context';
import { MESSAGE_TYPES } from '@/constants';

export type FlashListRenderProps = {
  item: { date: string } | Message;
  index: number;
};

const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList<Message | { date: string }>);

type DateSectionProps = { item: { date: string } };

const DateSection = ({ item }: DateSectionProps) => {
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
  const { progress, height } = useAppKeyboardAnimation();
  const { messageListRef } = useRefsContext();
  // The floating SLA pill shows only at the newest messages (the list is inverted, so that's an
  // offset near 0) and hides as soon as you scroll away, either way.
  const slaPill = useSlaPillVisibility();
  const isPillShown = useSharedValue(1);
  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
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

  // FlashList keeps the visible messages in place when new ones are added, so a message you
  // just sent would land below the view. When the newest message is one you sent, scroll to
  // it once it's in the list.
  const newest = messages[0];
  const newestId = newest && !('date' in newest) ? newest.id : null;
  const lastNewestId = useRef(newestId);
  useEffect(() => {
    if (newestId === lastNewestId.current) return;
    const isFirstLoad = lastNewestId.current === null;
    lastNewestId.current = newestId;
    if (isFirstLoad || !newest || 'date' in newest) return;
    const senderId = newest.sender?.id ?? newest.senderId;
    if (newest.messageType !== MESSAGE_TYPES.OUTGOING || senderId !== currentUserId) return;
    const frame = requestAnimationFrame(() => {
      typedMessageListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [newestId, newest, currentUserId, typedMessageListRef]);

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
