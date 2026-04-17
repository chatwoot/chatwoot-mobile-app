import React, { PropsWithChildren } from 'react';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { tailwind } from '@/theme';
import { useBottomSheetThemedStyles } from './useBottomSheetThemedStyles';

export const BottomSheetWrapper = (props: PropsWithChildren) => {
  const { children } = props;
  const bottomSheetStyles = useBottomSheetThemedStyles();

  return (
    <BottomSheetView style={[tailwind.style('flex-1'), bottomSheetStyles.contentStyle]}>
      {children}
    </BottomSheetView>
  );
};
