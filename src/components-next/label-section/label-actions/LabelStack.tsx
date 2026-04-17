import React from 'react';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { tailwind } from '@/theme';
import { Label } from '@/types';
import { useBottomSheetThemedStyles } from '@/components-next/common/bottomsheet';
import { LabelCell } from '../LabelCell';

type LabelStackProps = {
  filteredLabels: Label[];
  selectedLabels: string[];
  handleLabelPress: (label: string) => void;
  isStandAloneComponent?: boolean;
};

export const LabelStack = (props: LabelStackProps) => {
  const { filteredLabels, selectedLabels, isStandAloneComponent = true, handleLabelPress } = props;
  const bottomSheetStyles = useBottomSheetThemedStyles();

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      style={[tailwind.style('my-1 pl-3'), bottomSheetStyles.contentStyle]}>
      {filteredLabels.map((value, index) => {
        return (
          <LabelCell
            key={index}
            {...{ value, index }}
            handleLabelPress={handleLabelPress}
            isActive={selectedLabels.includes(value.title)}
            isLastItem={index === filteredLabels.length - 1 && isStandAloneComponent ? true : false}
          />
        );
      })}
    </BottomSheetScrollView>
  );
};
