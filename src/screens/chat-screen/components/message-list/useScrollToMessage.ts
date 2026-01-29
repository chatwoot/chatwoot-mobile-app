import { useEffect, useRef } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Message } from '@/types';

type MessageOrDate = Message | { date: string };

interface UseScrollToMessageParams {
  messageId?: number;
  messages: MessageOrDate[];
  messageListRef: React.RefObject<FlashList<MessageOrDate>>;
  isFlashListReady: boolean;
  onPositioned: () => void;
}

/**
 * Hook to handle scrolling to a target message when navigating from search.
 * Positions the target message at the top of the viewport.
 */
export function useScrollToMessage({
  messageId,
  messages,
  messageListRef,
  isFlashListReady,
  onPositioned,
}: UseScrollToMessageParams) {
  const hasPositionedMessageRef = useRef(false);

  // Reset positioning state when messageId changes
  useEffect(() => {
    if (messageId) {
      hasPositionedMessageRef.current = false;
    }
  }, [messageId]);

  // Position target message at top when navigating from search
  useEffect(() => {
    if (!messageId || !isFlashListReady || messages.length === 0) return;
    if (hasPositionedMessageRef.current) return;

    const targetIndex = messages.findIndex(
      (item) => !('date' in item) && 'id' in item && item.id === messageId,
    );

    // If target message not found, make list visible anyway
    if (targetIndex === -1) {
      const fallbackTimer = setTimeout(() => {
        hasPositionedMessageRef.current = true;
        onPositioned();
      }, 100);
      return () => clearTimeout(fallbackTimer);
    }

    // Initial scroll (may be inaccurate before items render)
    messageListRef.current?.scrollToIndex({
      index: targetIndex,
      animated: false,
      viewPosition: 1,
    });

    // Correct scroll after items render and measure
    const timer = setTimeout(() => {
      messageListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: false,
        viewPosition: 1,
      });

      requestAnimationFrame(() => {
        hasPositionedMessageRef.current = true;
        onPositioned();
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [messageId, isFlashListReady, messages, messageListRef, onPositioned]);
}
