import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useSideTabBarLayout } from '@/utils';

type ToolbarEntry = { owner: string; items: React.ReactNode };

const ToolbarItemsContext = createContext<React.ReactNode>(null);
const SetToolbarContext = createContext<React.Dispatch<
  React.SetStateAction<ToolbarEntry | null>
> | null>(null);

export const SideToolbarProvider = ({ children }: PropsWithChildren) => {
  const [entry, setEntry] = useState<ToolbarEntry | null>(null);
  return (
    <SetToolbarContext.Provider value={setEntry}>
      <ToolbarItemsContext.Provider value={entry?.items ?? null}>
        {children}
      </ToolbarItemsContext.Provider>
    </SetToolbarContext.Provider>
  );
};

export const useSideToolbarItems = () => useContext(ToolbarItemsContext);

// Callers must memoize items.
export const useSideToolbar = (items: React.ReactNode, enabled = true) => {
  const setEntry = useContext(SetToolbarContext);
  const owner = useId();
  const isFocused = useIsFocused();
  const isSide = useSideTabBarLayout() !== null;
  const active = enabled && isSide && isFocused && setEntry !== null;

  useEffect(() => {
    if (!active || !setEntry) return;
    setEntry({ owner, items });
    return () => setEntry(current => (current?.owner === owner ? null : current));
  }, [active, setEntry, owner, items]);

  return isSide;
};
