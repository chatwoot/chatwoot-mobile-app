import React, { createContext, PropsWithChildren, useContext } from 'react';
import { View } from 'react-native';

import { tailwind } from '@/theme';

const SelectedRowContext = createContext(false);

export const useIsRowSelected = () => useContext(SelectedRowContext);

export const SelectedRowBackground = ({
  selected,
  beforeSelected = false,
  children,
}: PropsWithChildren<{
  selected: boolean;
  beforeSelected?: boolean;
}>) => (
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
