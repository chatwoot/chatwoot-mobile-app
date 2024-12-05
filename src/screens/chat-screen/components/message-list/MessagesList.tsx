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
import { MessageItemContainer } from '../message-item';
import { useRefsContext } from '@/context';

export type FlashListRenderProps = {
  item: { date: string } | Message;
  index: number;
};

const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList<Message | { date: string }>);

type MessagesListPresentationProps = {
  messages: (Message | { date: string })[];
  isFlashListReady: boolean;
  setFlashListReady: (ready: boolean) => void;
  onEndReached: () => void;
};

export const MessagesList = ({
  messages,
  isFlashListReady,
  setFlashListReady,
  onEndReached,
}: MessagesListPresentationProps) => {
  const { progress, height } = useAppKeyboardAnimation();
  const { messageListRef } = useRefsContext();
  const typedMessageListRef = messageListRef as React.RefObject<
    FlashList<Message | { date: string }>
  >;

  const handleRender = ({ item, index }: { item: Message | { date: string }; index: number }) => {
    return <MessageItemContainer item={item} index={index} />;
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
        onScroll={() => {
          if (!isFlashListReady) {
            setFlashListReady(true);
          }
        }}
        ref={typedMessageListRef}
        inverted
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        renderItem={handleRender}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        data={messages}
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
