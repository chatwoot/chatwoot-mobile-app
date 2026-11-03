import { useEffect, useState } from 'react';

// Hands a full-screen chat over to the split view when the Duo is unfolded: the chat screen
// closes and the list's split view opens the same conversation in its pane.
let pendingConversationId: number | null = null;
const listeners = new Set<() => void>();

export const handOffToSplitView = (conversationId: number) => {
  pendingConversationId = conversationId;
  listeners.forEach(listener => listener());
};

/** Takes the pending conversation, if any (only one split view should take it). */
export const takeSplitHandoff = () => {
  const id = pendingConversationId;
  pendingConversationId = null;
  return id;
};

/** Re-renders when a handoff arrives, so a split view can take it. */
export const useSplitHandoffSignal = () => {
  const [signal, setSignal] = useState(0);
  useEffect(() => {
    const listener = () => setSignal(value => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return signal;
};
