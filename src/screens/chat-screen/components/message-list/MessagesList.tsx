import React from 'react';

import Animated, {
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useAppKeyboardAnimation } from '@/utils';
import { tailwind } from '@/theme';
import { Message } from '@/types';
import { MessageComponent } from '../message-item/Message';
// import { MessageItemContainer } from '../message-item/MessageItemContainer';
import { useRefsContext } from '@/context';

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
  const typedMessageListRef = messageListRef as React.RefObject<
    FlashListRef<Message | { date: string }>
  >;

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
    // TODO: Deprecate this after the new message item is ready
    // return <MessageItemContainer item={item} index={index} />;
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
    <Animated.View
      layout={LinearTransition.springify().damping(38).stiffness(240)}
      style={[tailwind.style('flex-1 min-h-10'), animatedFlashlistStyle]}>
      <AnimatedFlashlist
        layout={LinearTransition.springify().damping(38).stiffness(240)}
        onLoad={() => {
          // Search navigation positions once items are drawn (measured), so
          // scroll-to-target lands accurately.
          if (isSearchNavigation && !isFlashListReady) {
            setFlashListReady(true);
          }
        }}
        onScroll={() => {
          // Normal chat marks ready on first scroll.
          if (!isSearchNavigation && !isFlashListReady) {
            setFlashListReady(true);
          }
        }}
        ref={typedMessageListRef}
        // Inverted keeps the newest message anchored at the bottom; data is
        // newest-first, older history loads via onEndReached and newer via
        // onStartReached. maintainVisibleContentPosition holds position when
        // messages are prepended; getItemType + drawDistance reduce the
        // re-measure blank when paging.
        inverted
        maintainVisibleContentPosition={{ autoscrollToBottomThreshold: 0.2 }}
        getItemType={item => ('date' in item ? 'date' : 'message')}
        drawDistance={500}
        showsVerticalScrollIndicator={false}
        renderItem={handleRender}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
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
