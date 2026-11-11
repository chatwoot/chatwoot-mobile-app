import { createContext, useContext, useSyncExternalStore } from 'react';

// Published when a slide starts.
export type ColumnOpenStore = {
  get: () => boolean;
  set: (open: boolean) => void;
  subscribe: (listener: () => void) => () => void;
};

export const createColumnOpenStore = (): ColumnOpenStore => {
  let open = false;
  const listeners = new Set<() => void>();
  return {
    get: () => open,
    set: next => {
      if (next === open) return;
      open = next;
      listeners.forEach(listener => listener());
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const ColumnOpenStoreContext = createContext<ColumnOpenStore | null>(null);

const noopSubscribe = () => () => {};

export const useIsColumnOpen = (): boolean | null => {
  const store = useContext(ColumnOpenStoreContext);
  const open = useSyncExternalStore(store?.subscribe ?? noopSubscribe, () => store?.get() ?? false);
  return store ? open : null;
};
