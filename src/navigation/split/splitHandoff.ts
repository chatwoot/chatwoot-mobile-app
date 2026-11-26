import { useEffect, useState } from 'react';

type SplitHandoff = { conversationId: number; contactId?: number };

let pendingHandoff: SplitHandoff | null = null;
const listeners = new Set<() => void>();

export const handOffToSplitView = (conversationId: number, contactId?: number) => {
  pendingHandoff = { conversationId, contactId };
  listeners.forEach(listener => listener());
};

export const takeSplitHandoff = () => {
  const handoff = pendingHandoff;
  pendingHandoff = null;
  return handoff;
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
