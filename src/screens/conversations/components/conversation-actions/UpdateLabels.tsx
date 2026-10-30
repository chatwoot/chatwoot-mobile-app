import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';

import { tailwind } from '@/theme';
import { SearchBar } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { filterLabels } from '@/store/label/labelSelectors';
import { Label } from '@/types/common/Label';
import {
  selectSelectedIds,
  selectSelectedConversations,
} from '@/store/conversation/conversationSelectedSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { selectConversationsState } from '@/store/conversation/conversationSelectors';
import { LabelCell } from '@/components-next/label-section';
import i18n from '@/i18n';
import { commonLabels, toggleLabel } from './labelSelection';

type LabelStackProps = {
  labelList: Label[];
  selectedLabels: string[];
  handleLabelPress: (labelText: string) => void;
  isStandAloneComponent?: boolean;
};

export const LabelStack = (props: LabelStackProps) => {
  const { labelList, handleLabelPress, selectedLabels, isStandAloneComponent = true } = props;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={tailwind.style('my-1 pl-3')}>
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
    </ScrollView>
  );
};

export const UpdateLabels = () => {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedIds);
  const conversations = useAppSelector(selectSelectedConversations);
  const entities = useAppSelector(selectConversationsState).entities;
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedLabels, setSelectedLabels] = useState<string[]>(() =>
    commonLabels(conversations.map(conversation => entities[conversation.id] ?? conversation)),
  );

  const allLabels = useAppSelector(state => filterLabels(state, searchTerm));

  const handleLabelPress = (_selectedLabel: string) => {
    const result = toggleLabel(selectedLabels, _selectedLabel);
    setSelectedLabels(result.selected);
    dispatch(
      conversationActions.bulkAction({
        type: 'Conversation',
        ids: selectedIds,
        labels: result.action,
      }),
    );
  };

  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
  }, []);

  return (
    <React.Fragment>
      <SearchBar
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
