import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { ConversationStatus, StatusCollection } from '@/types';
import { getStatusTypeIcon, useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next';
import { useAppDispatch, useAppSelector, useThemedStyles } from '@/hooks';
import {
  selectSelectedConversation,
  selectSelectedIds,
} from '@/store/conversation/conversationSelectedSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import i18n from '@/i18n';
import { StatusOptions } from '@/types';
type StatusCellProps = {
  value: StatusCollection;
  isLastItem: boolean;
  onPress: (status: ConversationStatus) => void;
};

const StatusList: StatusCollection[] = [
  { id: 'open', icon: getStatusTypeIcon('open') },
  { id: 'pending', icon: getStatusTypeIcon('pending') },
  { id: 'snoozed', icon: getStatusTypeIcon('snoozed') },
  { id: 'resolved', icon: getStatusTypeIcon('resolved') },
];

const StatusCell = (props: StatusCellProps) => {
  const { value, isLastItem, onPress } = props;
  const themedTailwind = useThemedStyles();
  return (
    <Pressable
      onPress={() => onPress(value.id)}
      style={tailwind.style('flex flex-row items-center')}>
      <Animated.View>
        <Icon icon={value.icon} size={24} />
      </Animated.View>
      <Animated.View
        style={themedTailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !isLastItem ? 'border-b-[1px] border-b-gray-200' : '',
        )}>
        <Animated.Text
          style={themedTailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {i18n.t(`CONVERSATION.ASSIGNEE.STATUS.OPTIONS.${StatusOptions[value.id].toUpperCase()}`)}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const filterStatusList = (status: ConversationStatus) => {
  return StatusList.filter(item => item.id !== status);
};

export const UpdateStatus = () => {
  const { actionsModalSheetRef } = useRefsContext();

  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedIds);
  const selectedConversation = useAppSelector(selectSelectedConversation);
  const isMultipleConversationsSelected = selectedIds.length !== 0;
  const statusList = isMultipleConversationsSelected
    ? StatusList
    : filterStatusList(selectedConversation?.status || 'open');

  const hapticSelection = useHaptic();

  const handleStatusPress = (status: ConversationStatus) => {
    hapticSelection?.();
    if (isMultipleConversationsSelected) {
      const payload = { type: 'Conversation', ids: selectedIds, fields: { status } };
      dispatch(conversationActions.bulkAction(payload));
      actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
      dispatch(setCurrentState('none'));
    } else {
      if (!selectedConversation?.id) return;
      dispatch(
        conversationActions.toggleConversationStatus({
          conversationId: selectedConversation?.id,
          payload: {
            status,
            snoozed_until: null,
          },
        }),
      );
      actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    }
  };

  return (
    <BottomSheetView>
      <BottomSheetHeader headerText={i18n.t('CONVERSATION.CHANGE_STATUS')} />
      <Animated.View style={tailwind.style('py-1 pl-3')}>
        {statusList.map((value, index) => (
          <StatusCell
            key={index}
            {...{ value, isLastItem: index === statusList.length - 1 }}
            onPress={() => handleStatusPress(value.id)}
          />
        ))}
      </Animated.View>
    </BottomSheetView>
  );
};
