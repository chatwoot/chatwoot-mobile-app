import { useEffect, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useChatWindowContext } from '@/context';

interface UseTargetMessageAnimationParams {
  isTargetMessage: boolean;
  isListPositioned: boolean;
}

/**
 * Hook to handle zoom and highlight animation for target messages.
 * Triggers from both search navigation (contextMessageId) and quote tap (scrollToMessageId).
 */
export function useTargetMessageAnimation({
  isTargetMessage,
  isListPositioned,
}: UseTargetMessageAnimationParams) {
  const messageScale = useSharedValue(1);
  const highlightOpacity = useSharedValue(0);
  const { messageId: contextMessageId, scrollToMessageId } = useChatWindowContext();
  const lastAnimatedTriggerRef = useRef<number | undefined>(undefined);
  const prevScrollToMessageIdRef = useRef<number | undefined>(undefined);

  // Combine both triggers into one — scrollToMessageId takes priority
  const activeTriggerId = scrollToMessageId ?? contextMessageId;
  // For quote taps, skip the isListPositioned check since the list is already visible
  const isQuoteTap = scrollToMessageId !== undefined;

  // When scrollToMessageId transitions from a value to undefined (i.e. quote scroll
  // finished), restore the guard to contextMessageId so the search target doesn't
  // re-animate, while ensuring a repeat quote tap can still trigger.
  useEffect(() => {
    const wasSet = prevScrollToMessageIdRef.current !== undefined;
    prevScrollToMessageIdRef.current = scrollToMessageId;

    if (wasSet && scrollToMessageId === undefined) {
      lastAnimatedTriggerRef.current = contextMessageId;
    }
  }, [scrollToMessageId, contextMessageId]);

  useEffect(() => {
    if (!isTargetMessage || activeTriggerId === undefined || (!isListPositioned && !isQuoteTap)) {
      messageScale.value = 1;
      highlightOpacity.value = 0;
      return;
    }

    // Only animate once per trigger to avoid re-triggering on re-renders
    if (lastAnimatedTriggerRef.current === activeTriggerId) return;
    lastAnimatedTriggerRef.current = activeTriggerId;

    messageScale.value = 1;
    highlightOpacity.value = 0;

    messageScale.value = withDelay(
      150,
      withSequence(
        withTiming(1.08, { duration: 180, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 160, easing: Easing.inOut(Easing.cubic) }),
        withTiming(1.02, { duration: 100, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 130, easing: Easing.inOut(Easing.cubic) }),
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
  }, [isTargetMessage, activeTriggerId, isListPositioned, isQuoteTap, messageScale, highlightOpacity]);

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
