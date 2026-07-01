import { useCallback, useEffect, useRef, useState } from 'react';
import { FlashListRef } from '@shopify/flash-list';
import { Message } from '@/types';

type MessageOrDate = Message | { date: string };

interface UseScrollToMessageParams {
  // Target opened from search. Undefined for a normal chat session.
  messageId?: number;
  // Target from tapping a quoted reply. Set transiently, then cleared.
  scrollToMessageId?: number;
  clearScrollToMessageId: () => void;
  messages: MessageOrDate[];
  messageListRef: React.RefObject<FlashListRef<MessageOrDate>>;
  isFlashListReady: boolean;
  isLoadingMessages: boolean;
}

// Reveal the list even if the target never appears in the data (e.g. deleted).
const TARGET_NOT_FOUND_TIMEOUT_MS = 5000;
// How long the highlight stays set before it is cleared so it can replay.
const HIGHLIGHT_DURATION_MS = 1600;
// Delay before highlighting an animated (quote-tap) scroll so the pulse plays
// once the scroll has moved rather than during it. Search jumps are instant.
const ANIMATED_HIGHLIGHT_DELAY_MS = 350;

const findMessageIndex = (messages: MessageOrDate[], id: number) =>
  messages.findIndex(item => !('date' in item) && 'id' in item && item.id === id);

/**
 * Drives scroll-to-message for both entry points (search navigation and quoted
 * reply taps): the target is scrolled to center and then highlighted. Returns
 * the id to highlight and whether the list should be shown (search keeps it
 * hidden until the target is positioned).
 */
export function useScrollToMessage({
  messageId,
  scrollToMessageId,
  clearScrollToMessageId,
  messages,
  messageListRef,
  isFlashListReady,
  isLoadingMessages,
}: UseScrollToMessageParams) {
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | undefined>(undefined);
  const [isListVisible, setIsListVisible] = useState(!messageId);

  // Read messages from a ref so scrollThenHighlight keeps a stable identity and
  // the effects below don't re-run on every data change.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Scroll the target to center, then highlight it. scrollToIndex is
  // fire-and-forget; the highlight is deferred so it resets for repeat taps and
  // plays after an animated scroll rather than during it.
  const scrollThenHighlight = useCallback(
    (id: number, animated: boolean) => {
      const index = findMessageIndex(messagesRef.current, id);
      if (index < 0) return false;
      setHighlightedMessageId(undefined);
      try {
        messageListRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated });
      } catch {
        // Index can be transiently out of range during a layout change.
      }
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(
        () => setHighlightedMessageId(id),
        animated ? ANIMATED_HIGHLIGHT_DELAY_MS : 0,
      );
      return true;
    },
    [messageListRef],
  );

  useEffect(() => () => clearTimeout(highlightTimerRef.current), []);

  // Clear the highlight once it has played so it can be triggered again.
  useEffect(() => {
    if (highlightedMessageId === undefined) return;
    const timer = setTimeout(() => setHighlightedMessageId(undefined), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [highlightedMessageId]);

  // Reset visibility when the search target changes.
  useEffect(() => {
    setIsListVisible(!messageId);
  }, [messageId]);

  // Search navigation: position the target once it has loaded and the list is
  // laid out, then reveal the list.
  const positionedRef = useRef(false);
  useEffect(() => {
    positionedRef.current = false;
  }, [messageId]);

  useEffect(() => {
    if (!messageId || !isFlashListReady || positionedRef.current || messages.length === 0) return;

    if (findMessageIndex(messages, messageId) < 0) {
      // Target not in the data; reveal once loading settles so the list isn't stuck.
      if (!isLoadingMessages) {
        positionedRef.current = true;
        setIsListVisible(true);
      }
      return;
    }

    positionedRef.current = true;
    scrollThenHighlight(messageId, false);
    setIsListVisible(true);
  }, [messageId, isFlashListReady, isLoadingMessages, messages, scrollThenHighlight]);

  useEffect(() => {
    if (!messageId) return;
    const timer = setTimeout(() => {
      if (!positionedRef.current) setIsListVisible(true);
    }, TARGET_NOT_FOUND_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [messageId]);

  // Quoted reply tap: animate-scroll to the target, then clear the transient id.
  useEffect(() => {
    if (scrollToMessageId === undefined) return;
    scrollThenHighlight(scrollToMessageId, true);
    const timer = setTimeout(() => clearScrollToMessageId(), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [scrollToMessageId, scrollThenHighlight, clearScrollToMessageId]);

  return { highlightedMessageId, isListVisible };
}
