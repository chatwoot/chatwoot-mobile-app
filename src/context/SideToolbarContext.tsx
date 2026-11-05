import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import { useAppAppearance } from '@/theme/appearance';
import { useIsFocused } from '@react-navigation/native';

import { useSideTabBarLayout } from '@/utils';

// When tabs sit on the side (iPhone Duo), header actions move into a side toolbar
// at the top of the same column (Apple HIG, "Designing for iPhone Duo"). The focused
// tab screen hands its actions to this slot and the tab bar renders them, so the
// buttons live at screen level next to the tab capsule.

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

/** Items to draw in the side toolbar, for the tab bar to render. */
export const useSideToolbarItems = () => useContext(ToolbarItemsContext);

/**
 * Shows `items` in the side toolbar while the calling screen is focused and tabs are
 * on the side. Pass every value the items depend on in `deps`. Pass `enabled: false`
 * to keep the items in the header instead (e.g. above the list in a split view).
 * Returns true when tabs are on the side, so the header can switch to its side layout.
 */
export const useSideToolbar = (
  items: React.ReactNode,
  deps: React.DependencyList,
  enabled = true,
) => {
  const appearance = useAppAppearance();
  const setEntry = useContext(SetToolbarContext);
  const owner = useId();
  const isFocused = useIsFocused();
  const isSide = useSideTabBarLayout() !== null;
  const active = enabled && isSide && isFocused && setEntry !== null;

  useEffect(() => {
    if (!active || !setEntry) return;
    setEntry({ owner, items });
    return () => setEntry(current => (current?.owner === owner ? null : current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, setEntry, owner, appearance, ...deps]);

  return isSide;
};
