import React, { useCallback, useState } from 'react';
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
import { LabelCell } from '@/components-next/label-section';

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
