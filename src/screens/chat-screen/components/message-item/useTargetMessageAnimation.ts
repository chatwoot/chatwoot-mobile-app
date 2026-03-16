import { useEffect, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useChatWindowContext } from '@/context';

interface UseTargetMessageAnimationParams {
  isTargetMessage: boolean;
  messageId: number;
  isListPositioned: boolean;
}

/**
 * Hook to handle zoom and highlight animation for target messages when navigating from search.
 * Animation triggers only after the list is positioned and visible, avoiding the race
 * condition where a fixed delay could fire while the list is still hidden.
 */
export function useTargetMessageAnimation({
  isTargetMessage,
  messageId,
  isListPositioned,
}: UseTargetMessageAnimationParams) {
  const messageScale = useSharedValue(1);
  const highlightOpacity = useSharedValue(0);
  const { messageId: contextMessageId } = useChatWindowContext();
  const lastAnimatedContextMessageIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isTargetMessage || contextMessageId === undefined || !isListPositioned) {
      messageScale.value = 1;
      highlightOpacity.value = 0;
      return;
    }

    // Only animate once per contextMessageId to avoid re-triggering on re-renders
    if (lastAnimatedContextMessageIdRef.current === contextMessageId) return;
    lastAnimatedContextMessageIdRef.current = contextMessageId;

    messageScale.value = 1;
    highlightOpacity.value = 0;

    // Short delay after list is visible to let the user register the message position
    // before the highlight draws their attention
    messageScale.value = withDelay(
      150,
      withSequence(
        withSpring(1.08, { damping: 12, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 300 }),
        withSpring(1.02, { damping: 20, stiffness: 400 }),
        withSpring(1, { damping: 18, stiffness: 350 }),
      ),
    );
    highlightOpacity.value = withDelay(
      150,
      withSequence(
        withTiming(0.5, { duration: 150 }),
        withTiming(0.25, { duration: 200 }),
        withTiming(0, { duration: 300 }),
      ),
    );
  }, [isTargetMessage, messageId, contextMessageId, isListPositioned, messageScale, highlightOpacity]);

  const zoomStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: messageScale.value }],
    };
  });

  const highlightStyle = useAnimatedStyle(() => {
    return {
      opacity: highlightOpacity.value,
    };
  });

  return {
    zoomStyle,
    highlightStyle,
  };
}
