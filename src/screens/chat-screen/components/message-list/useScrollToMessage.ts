import { useEffect, useRef } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Message } from '@/types';

type MessageOrDate = Message | { date: string };

interface UseScrollToMessageParams {
  messageId?: number;
  messages: MessageOrDate[];
  messageListRef: React.RefObject<FlashList<MessageOrDate>>;
  isFlashListReady: boolean;
  isLoadingMessages: boolean;
  onPositioned: () => void;
}

// Maximum time to wait for the target message to appear in the data
// before giving up and showing the list as-is (safety net)
const TARGET_MESSAGE_TIMEOUT_MS = 5000;

/**
 * Hook to handle scrolling to a target message when navigating from search.
 * Uses multiple staggered scroll attempts to work around FlashList's estimated
 * item size inaccuracy (items near the target get measured progressively).
 *
 * viewPosition: 0.5 centers the target in the viewport, which provides
 * tolerance for estimation errors in both directions. This is especially
 * important because the list is inverted (viewPosition coordinates are
 * flipped relative to the visual layout).
 */
export function useScrollToMessage({
  messageId,
  messages,
  messageListRef,
  isFlashListReady,
  isLoadingMessages,
  onPositioned,
}: UseScrollToMessageParams) {
  const hasPositionedMessageRef = useRef(false);

  // Reset positioning state when messageId changes
  useEffect(() => {
    if (messageId) {
      hasPositionedMessageRef.current = false;
    }
  }, [messageId]);

  // Safety-net timeout: if the target message never appears in the data
  // (e.g. it was deleted), reveal the list after a reasonable wait
  useEffect(() => {
    if (!messageId) return;

    const timeout = setTimeout(() => {
      if (!hasPositionedMessageRef.current) {
        onPositioned();
      }
    }, TARGET_MESSAGE_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [messageId, onPositioned]);

  // Position target message when navigating from search
  useEffect(() => {
    if (!messageId || !isFlashListReady || messages.length === 0) return;
    if (hasPositionedMessageRef.current) return;

    const targetIndex = messages.findIndex(
      item => !('date' in item) && 'id' in item && item.id === messageId,
    );

    // Target message not in the data yet
    if (targetIndex === -1) {
      // If messages finished loading and target still not found (e.g. deleted),
      // reveal the list immediately instead of waiting for the 5s timeout
      if (!isLoadingMessages) {
        hasPositionedMessageRef.current = true;
        onPositioned();
      }
      return;
    }

    const scrollToTarget = () => {
      try {
        messageListRef.current?.scrollToIndex({
          index: targetIndex,
          animated: false,
          viewPosition: 0.5,
        });
      } catch {
        // scrollToIndex can throw if index is out of range during layout changes
      }
    };

    // Staggered scroll attempts — each one becomes more accurate as FlashList
    // measures actual item heights for items rendered near the target.
    //
    // Attempt 1 (immediate): uses estimated sizes, gets FlashList to render
    //   items near the target so they can be measured.
    // Attempt 2 (200ms): items near target are now measured, position improves.
    // Attempt 3 (450ms): final correction with most items measured.
    const delays = [0, 200, 450];
    const timers: ReturnType<typeof setTimeout>[] = [];

    delays.forEach((delay, i) => {
      const timer = setTimeout(() => {
        scrollToTarget();

        // After the last scroll attempt, reveal the list
        if (i === delays.length - 1) {
          const revealTimer = setTimeout(() => {
            requestAnimationFrame(() => {
              hasPositionedMessageRef.current = true;
              onPositioned();
            });
          }, 100);
          timers.push(revealTimer);
        }
      }, delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [messageId, isFlashListReady, isLoadingMessages, messages, messageListRef, onPositioned]);
}
