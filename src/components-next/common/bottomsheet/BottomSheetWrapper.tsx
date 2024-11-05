import React, { PropsWithChildren } from 'react';
import { BottomSheetView } from '@gorhom/bottom-sheet';

export const BottomSheetWrapper = (props: PropsWithChildren) => {
  const { children } = props;
  return <BottomSheetView>{children}</BottomSheetView>;
};
