import { useTailwind } from '@/theme/useTailwind';
import React, { createContext, PropsWithChildren, useContext } from 'react';
import { View } from 'react-native';

// Persistent highlight for the list row that's open in the split view's conversation
// pane (Apple HIG, Split views: "persistently highlight the current selection").
//
// Like native selected rows, it spans the full row height with a small side margin and
// hides the dividers next to it: the row's own divider via `useIsRowSelected`, and the
// one above by extending 1pt over it. The fill is solid (the light gray that 7.8% black
// gives on white) so it can cover that divider. Corners use a modest 10pt radius.

const SelectedRowContext = createContext(false);

/**
 * True when a row should hide its divider: it's the row open in the split view, or the row
 * just above it (so no line touches the highlight).
 */
export const useIsRowSelected = () => useContext(SelectedRowContext);

export const SelectedRowBackground = ({
  selected,
  beforeSelected = false,
  children,
}: PropsWithChildren<{
  selected: boolean;
  // The next row is the selected one: hide this row's divider too.
  beforeSelected?: boolean;
}>) => {
  const tailwind = useTailwind();
  return (
    <SelectedRowContext.Provider value={selected || beforeSelected}>
      <View>
        {selected ? (
          <View
            pointerEvents="none"
            style={tailwind.style(
              'absolute -top-px bottom-0 left-1.5 right-1.5 rounded-[10px] bg-[#EBEBEB]',
            )}
          />
        ) : null}
        {children}
      </View>
    </SelectedRowContext.Provider>
  );
};
