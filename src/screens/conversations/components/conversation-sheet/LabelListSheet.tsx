import React, { useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { SearchBar } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { filterLabels } from '@/store/label/labelSelectors';
import { Label } from '@/types/common/Label';
import { selectSelectedIds } from '@/store/conversation/conversationSelectedSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';

type LabelCellProps = {
  value: Label;
  index: number;
  handleLabelPress: (labelText: string) => void;
  isLastItem: boolean;
};

const LabelCell = (props: LabelCellProps) => {
  const { value, isLastItem, handleLabelPress } = props;

  const handleOnPress = useCallback(() => {
    handleLabelPress(value.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable onPress={handleOnPress} style={tailwind.style('flex flex-row items-center pl-1.5')}>
      <Animated.View style={tailwind.style('h-4 w-4 rounded-full', `bg-[${value.color}]`)} />
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
          {value.title}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

type LabelStackProps = {
  labelList: Label[];
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

export const LabelListSheet = () => {
  const { actionsModalSheetRef } = useRefsContext();
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedIds);
  const [searchTerm, setSearchTerm] = useState('');

  const allLabels = useAppSelector(state => filterLabels(state, searchTerm));

  const handleFocus = () => {
    actionsModalSheetRef.current?.expand();
  };
  const handleBlur = () => {
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
  };

  // The selected label text is received
  /**
   * The handleLabelPress function dismisses a modal sheet with overshoot clamping.
   * @param {string} _selectedLabel - The _selectedLabel parameter is a string that represents the label
   * that was selected.
   */
  const handleLabelPress = (_selectedLabel: string) => {
    const payload = {
      type: 'Conversation',
      ids: selectedIds,
      labels: { add: [_selectedLabel] },
    };
    dispatch(conversationActions.bulkAction(payload));
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    dispatch(setCurrentState('none'));
  };

  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
  }, []);

  return (
    <React.Fragment>
      <SearchBar
        isInsideBottomSheet
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={handleSearch}
        placeholder="Search labels"
      />
      <LabelStack labelList={allLabels} handleLabelPress={handleLabelPress} />
    </React.Fragment>
  );
};
