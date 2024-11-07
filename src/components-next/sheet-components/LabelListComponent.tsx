import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '../../context';
import { tailwind } from '../../theme';
import { LabelType } from '../../types';
import { SearchBar } from '../common';

type LabelCellProps = {
  value: LabelType;
  index: number;
  handleLabelPress: (labelText: string) => void;
  isLastItem: boolean;
};

const LabelCell = (props: LabelCellProps) => {
  const { value, isLastItem, handleLabelPress } = props;

  const handleOnPress = useCallback(() => {
    handleLabelPress(value.labelText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable onPress={handleOnPress} style={tailwind.style('flex flex-row items-center pl-1.5')}>
      <Animated.View style={tailwind.style('h-4 w-4 rounded-full', `${value.labelColor}`)} />
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !isLastItem ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={[
            tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            ),
          ]}>
          {value.labelText}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

type LabelStackProps = {
  labelList: LabelType[];
  handleLabelPress: (labelText: string) => void;
  isStandAloneComponent?: boolean;
};

export const LabelStack = (props: LabelStackProps) => {
  const { labelList, handleLabelPress, isStandAloneComponent = true } = props;
  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} style={tailwind.style('my-1 pl-3')}>
      {labelList.map((value, index) => {
        return (
          <LabelCell
            key={index}
            {...{ value, index }}
            handleLabelPress={handleLabelPress}
            isLastItem={index === labelList.length - 1 && isStandAloneComponent ? true : false}
          />
        );
      })}
    </BottomSheetScrollView>
  );
};

// This is the component for Listing All Labels

export const allLabels: LabelType[] = [
  {
    labelText: 'Production',
    labelColor: 'bg-green-700',
  },
  {
    labelText: 'Bug',
    labelColor: 'bg-crimson-700',
  },
  {
    labelText: 'Billing',
    labelColor: 'bg-cyan-700',
  },
  {
    labelText: 'Lead',
    labelColor: 'bg-tomato-700',
  },
  {
    labelText: 'Subscription',
    labelColor: 'bg-teal-700',
  },
  {
    labelText: 'Software',
    labelColor: 'bg-yellow-700',
  },
  {
    labelText: 'Marketing',
    labelColor: 'bg-blue-700',
  },
  {
    labelText: 'Complaint',
    labelColor: 'bg-purple-700',
  },
  {
    labelText: 'Feedback',
    labelColor: 'bg-red-700',
  },
  {
    labelText: 'Mark as Read',
    labelColor: 'bg-pink-700',
  },
  {
    labelText: 'Integration',
    labelColor: 'bg-pink-700',
  },
  {
    labelText: 'Needs Attention',
    labelColor: 'bg-pink-700',
  },
  {
    labelText: 'Product Feedback',
    labelColor: 'bg-pink-700',
  },
];

export const LabelListComponent = () => {
  const { actionsModalSheetRef } = useRefsContext();
  const handleFocus = () => {
    actionsModalSheetRef.current?.expand();
  };
  const handleBlur = () => {
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
  };
  const { filtersModalSheetRef } = useRefsContext();

  // The selected label text is received
  /**
   * The handleLabelPress function dismisses a modal sheet with overshoot clamping.
   * @param {string} _selectedLabel - The _selectedLabel parameter is a string that represents the label
   * that was selected.
   */
  const handleLabelPress = (_selectedLabel: string) => {
    filtersModalSheetRef.current?.dismiss({ overshootClamping: true });
  };

  return (
    <React.Fragment>
      <SearchBar
        isInsideBottomsheet
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Search labels"
      />
      <LabelStack labelList={allLabels} handleLabelPress={handleLabelPress} />
    </React.Fragment>
  );
};
