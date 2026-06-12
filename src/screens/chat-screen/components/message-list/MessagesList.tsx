import React from 'react';

import Animated, {
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
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
  isEmailInbox: boolean;
  currentUserId: number;
  targetMessageId?: number;
  initialScrollIndex?: number;
  isListPositioned?: boolean;
};

export const MessagesList = ({
  messages,
  isFlashListReady,
  setFlashListReady,
  onEndReached,
  isEmailInbox,
  currentUserId,
  targetMessageId,
  initialScrollIndex,
  isListPositioned = true,
}: MessagesListPresentationProps) => {
  const { progress, height } = useAppKeyboardAnimation();
  const { messageListRef } = useRefsContext();
  const typedMessageListRef = messageListRef as React.RefObject<
    FlashList<Message | { date: string }>
  >;

  const handleRender = ({ item, index }: { item: Message | { date: string }; index: number }) => {
    if ('date' in item) {
      return <DateSection item={item} />;
    }

    const isTarget = targetMessageId !== undefined && targetMessageId === item.id;

    return (
      <MessageComponent
        item={item}
        index={index}
        isEmailInbox={isEmailInbox}
        currentUserId={currentUserId}
        isTargetMessage={isTarget}
        isListPositioned={isListPositioned}
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
        onLayout={() => {
          // For search navigation, mark ready on layout since there's no user scroll
          if (targetMessageId && !isFlashListReady) {
            setFlashListReady(true);
          }
        }}
        onScroll={() => {
          // For normal chat, mark ready on first scroll (preserves existing behavior)
          if (!targetMessageId && !isFlashListReady) {
            setFlashListReady(true);
          }
        }}
        ref={typedMessageListRef}
        inverted
        estimatedItemSize={100}
        {...(initialScrollIndex !== undefined ? { initialScrollIndex } : {})}
        showsVerticalScrollIndicator={false}
        renderItem={handleRender}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
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
