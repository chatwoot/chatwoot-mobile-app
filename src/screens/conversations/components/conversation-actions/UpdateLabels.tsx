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
import { LabelCell } from '@/components-next/label-section';
import i18n from '@/i18n';

type LabelStackProps = {
  labelList: Label[];
  selectedLabels: string[];
  handleLabelPress: (labelText: string) => void;
  isStandAloneComponent?: boolean;
};

export const LabelStack = (props: LabelStackProps) => {
  const { labelList, handleLabelPress, selectedLabels, isStandAloneComponent = true } = props;

  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} style={tailwind.style('my-1 pl-3')}>
      {labelList.map((value, index) => {
        return (
          <LabelCell
            key={index}
            {...{ value, index }}
            handleLabelPress={handleLabelPress}
            isActive={selectedLabels && selectedLabels.includes(value.title)}
            isLastItem={index === labelList.length - 1 && isStandAloneComponent ? true : false}
          />
        );
      })}
    </BottomSheetScrollView>
  );
};

export const UpdateLabels = () => {
  const { actionsModalSheetRef } = useRefsContext();
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedIds);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

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
    setSelectedLabels(prevLabels => {
      const updatedLabels = prevLabels.includes(_selectedLabel)
        ? prevLabels.filter(item => item !== _selectedLabel)
        : [...prevLabels, _selectedLabel];

      // If label is already selected, return current labels without changes
      if (prevLabels.includes(_selectedLabel)) {
        return prevLabels;
      }

      const payload = {
        type: 'Conversation',
        ids: selectedIds,
        labels: { add: [_selectedLabel] },
      };
      dispatch(conversationActions.bulkAction(payload));
      // actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
      // dispatch(setCurrentState('none'));
      return updatedLabels;
    });
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
        placeholder={i18n.t('CONVERSATION.ASSIGNEE.LABELS.SEARCH_LABELS')}
      />
      <LabelStack
        labelList={allLabels}
        handleLabelPress={handleLabelPress}
        selectedLabels={selectedLabels}
      />
    </React.Fragment>
  );
};
