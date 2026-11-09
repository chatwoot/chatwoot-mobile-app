import { useEffect, useState } from 'react';

let pendingConversationId: number | null = null;
const listeners = new Set<() => void>();

export const handOffToSplitView = (conversationId: number) => {
  pendingConversationId = conversationId;
  listeners.forEach(listener => listener());
};

export const takeSplitHandoff = () => {
  const id = pendingConversationId;
  pendingConversationId = null;
  return id;
};

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
