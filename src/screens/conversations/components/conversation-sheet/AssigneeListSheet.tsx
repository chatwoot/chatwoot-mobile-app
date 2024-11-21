import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageSourcePropType, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { Agent } from '@/types';
import { Avatar, Icon, SearchBar } from '@/components-next';
import { TickIcon } from '@/svg-icons';

import { inboxAgentActions } from '@/store/inbox-agent/inboxAgentActions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { filterInboxAgents } from '@/store/inbox-agent/inboxAgentSelectors';
import {
  selectSelectedIds,
  selectSelectedInboxes,
  selectSelectedConversation,
} from '@/store/conversation/conversationSelectedSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { isInboxAgentFetching } from '@/store/inbox-agent/inboxAgentSelectors';
import { showToast } from '@/helpers/ToastHelper';
import i18n from '@/i18n';

type AssigneeCellProps = {
  value: Agent;
  lastItem: boolean;
  assigneeId: number | undefined;
};

const AssigneeCell = (props: AssigneeCellProps) => {
  const { value, lastItem, assigneeId } = props;
  const dispatch = useAppDispatch();

  const { actionsModalSheetRef } = useRefsContext();
  const selectedIds = useAppSelector(selectSelectedIds);
  const selectedConversation = useAppSelector(selectSelectedConversation);

  const isMultipleConversationsSelected = selectedIds.length !== 0;

  const handleAssigneePress = async () => {
    if (isMultipleConversationsSelected) {
      const payload = { type: 'Conversation', ids: selectedIds, fields: { assignee_id: value.id } };
      await dispatch(conversationActions.bulkAction(payload));
      actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    } else {
      if (!selectedConversation?.id) return;
      await dispatch(
        conversationActions.assignConversation({
          conversationId: selectedConversation?.id,
          assigneeId: value.id === assigneeId ? 0 : value.id,
        }),
      );
      showToast({
        message: i18n.t('CONVERSATION.ASSIGN_CHANGE'),
      });
      actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    }
  };

  return (
    <Pressable onPress={handleAssigneePress} style={tailwind.style('flex flex-row items-center')}>
      <Avatar src={value.thumbnail as ImageSourcePropType} name={value.name ?? ''} />
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !lastItem ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={[
            tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            ),
          ]}>
          {value.name}
        </Animated.Text>
        {assigneeId === value.id ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

const AssigneeStack = ({
  agents,
  assigneeId,
}: {
  agents: Agent[];
  assigneeId: number | undefined;
}) => {
  const isFetching = useAppSelector(isInboxAgentFetching);

  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} style={tailwind.style('my-1 pl-3')}>
      {isFetching ? (
        <ActivityIndicator />
      ) : (
        agents.map((value, index) => {
          return (
            <AssigneeCell
              key={index}
              {...{ value, lastItem: index === agents.length - 1, assigneeId }}
            />
          );
        })
      )}
    </BottomSheetScrollView>
  );
};

export const AssigneeListSheet = () => {
  const dispatch = useAppDispatch();
  const { actionsModalSheetRef } = useRefsContext();
  const [searchTerm, setSearchTerm] = useState('');

  const agents = useAppSelector(state => filterInboxAgents(state, searchTerm));
  const selectedInboxes = useAppSelector(selectSelectedInboxes);
  const selectedConversation = useAppSelector(selectSelectedConversation);

  const inboxId = selectedConversation?.inboxId;

  const inboxIds = inboxId ? [inboxId] : selectedInboxes;

  const assigneeId = selectedConversation?.meta?.assignee?.id;

  const handleFocus = () => {
    actionsModalSheetRef.current?.expand();
  };
  const handleBlur = () => {
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
  };

  useEffect(() => {
    dispatch(inboxAgentActions.fetchInboxAgents({ inboxIds }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeText = (text: string) => {
    setSearchTerm(text);
  };

  return (
    <React.Fragment>
      <SearchBar
        isInsideBottomSheet
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={handleChangeText}
        placeholder={i18n.t('CONVERSATION.ASSIGNEE.AGENTS.SEARCH_AGENT')}
      />
      <AssigneeStack agents={agents as Agent[]} assigneeId={assigneeId} />
    </React.Fragment>
  );
};
