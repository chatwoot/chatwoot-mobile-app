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
}

/**
 * Hook to handle zoom and highlight animation for target messages when navigating from search.
 * Provides animated styles for scale and highlight opacity.
 */
export function useTargetMessageAnimation({
  isTargetMessage,
  messageId,
}: UseTargetMessageAnimationParams) {
  const messageScale = useSharedValue(1);
  const highlightOpacity = useSharedValue(0);
  const { messageId: contextMessageId } = useChatWindowContext();
  const lastAnimatedContextMessageIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (lastAnimatedContextMessageIdRef.current !== contextMessageId) {
      if (lastAnimatedContextMessageIdRef.current !== undefined) {
        lastAnimatedContextMessageIdRef.current = undefined;
      }
    }

    if (!isTargetMessage) {
      messageScale.value = 1;
      highlightOpacity.value = 0;
      return;
    }

    if (
      isTargetMessage &&
      contextMessageId !== undefined &&
      lastAnimatedContextMessageIdRef.current !== contextMessageId
    ) {
      messageScale.value = 1;
      highlightOpacity.value = 0;
      lastAnimatedContextMessageIdRef.current = contextMessageId;

      // Use requestAnimationFrame to ensure the component is fully rendered
      requestAnimationFrame(() => {
        // Start animation after a delay to ensure message is visible
        messageScale.value = withDelay(
          600,
          withSequence(
            // Zoom in
            withSpring(1.08, { damping: 12, stiffness: 200 }),
            // Zoom out with bounce
            withSpring(1, { damping: 15, stiffness: 300 }),
            // Small bounce back
            withSpring(1.02, { damping: 20, stiffness: 400 }),
            // Final settle
            withSpring(1, { damping: 18, stiffness: 350 }),
          ),
        );
        // Subtle highlight that fades
        highlightOpacity.value = withDelay(
          600,
          withSequence(
            withTiming(0.4, { duration: 150 }),
            withTiming(0.2, { duration: 200 }),
            withTiming(0, { duration: 300 }),
          ),
        );
      });
    }
  }, [isTargetMessage, messageId, contextMessageId, messageScale, highlightOpacity]);

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
