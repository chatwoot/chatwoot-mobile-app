import { useEffect, useRef } from 'react';
import { FlashListRef } from '@shopify/flash-list';
import { SharedValue } from 'react-native-reanimated';
import { MESSAGE_TYPES } from '@/constants';
import { Message } from '@/types';

export const NEAR_BOTTOM_THRESHOLD = 80;

type MessageOrDate = Message | { date: string };

export interface UseAutoScrollToNewestParams {
  messages: MessageOrDate[];
  currentUserId: number;
  messageListRef: React.RefObject<FlashListRef<MessageOrDate> | null>;
  scrollY: SharedValue<number>;
  isSearchNavigation?: boolean;
}

/**
 * Automatically scrolls an inverted FlashList to the newest message (offset 0)
 * when a new message arrives and the user is at (or near) the bottom, or whenever
 * the current user sends a message. Preserves scroll position when the user is
 * scrolled up reading older history or navigating search results.
 */
export const useAutoScrollToNewest = ({
  messages,
  currentUserId,
  messageListRef,
  scrollY,
  isSearchNavigation = false,
}: UseAutoScrollToNewestParams) => {
  const newest = messages[0];
  const newestId = newest && !('date' in newest) ? newest.id : null;
  const lastNewestId = useRef(newestId);

  useEffect(() => {
    if (newestId === lastNewestId.current) return;
    const isFirstLoad = lastNewestId.current === null;
    lastNewestId.current = newestId;
    if (isFirstLoad || !newest || 'date' in newest) return;

    const senderId = newest.sender?.id ?? newest.senderId;
    const isSentByCurrentUser =
      newest.messageType === MESSAGE_TYPES.OUTGOING && senderId === currentUserId;

    // Do not scroll away from search target on incoming messages
    if (isSearchNavigation && !isSentByCurrentUser) return;

    // Inverted list: scrollY is ~0 at the bottom (newest messages).
    // If the user has scrolled up into history (scrollY >= threshold), preserve their reading position.
    const isNearBottom = scrollY.value < NEAR_BOTTOM_THRESHOLD;
    if (!isSentByCurrentUser && !isNearBottom) return;

    const frame = requestAnimationFrame(() => {
      messageListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [newestId, newest, currentUserId, messageListRef, scrollY, isSearchNavigation]);
};
