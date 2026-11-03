import { createContext, useContext, useSyncExternalStore } from 'react';

// Whether the split view's side column is open (or opening), published the moment a slide
// starts. The side toolbar reads this so its buttons switch right away, without waiting for the
// split view's state, which updates after the slide lands (to keep the slide smooth).
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

/** True while the side column is open or opening; null outside a split view. */
export const useIsColumnOpen = (): boolean | null => {
  const store = useContext(ColumnOpenStoreContext);
  const open = useSyncExternalStore(store?.subscribe ?? noopSubscribe, () => store?.get() ?? false);
  return store ? open : null;
};
