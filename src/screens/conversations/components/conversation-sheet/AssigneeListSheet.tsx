import React, { useEffect } from 'react';
import { ImageSourcePropType, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { Agent } from '@/types';
import { Avatar, SearchBar } from '@/components-next';

import { inboxAgentActions } from '@/store/inbox-agent/inboxAgentActions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllInboxAgents } from '@/store/inbox-agent/inboxAgentSelectors';
import {
  selectSelectedIds,
  selectSelectedInboxes,
} from '@/store/conversation/conversationSelectedSlice';
import { conversationActions } from '@/store/conversation/conversationActions';

type AssigneeCellProps = {
  value: Agent;
  lastItem: boolean;
};

const AssigneeCell = (props: AssigneeCellProps) => {
  const { value, lastItem } = props;
  const dispatch = useAppDispatch();

  const { filtersModalSheetRef } = useRefsContext();
  const selectedIds = useAppSelector(selectSelectedIds);

  const handleAssigneePress = () => {
    const payload = { type: 'Conversation', ids: selectedIds, fields: { assignee_id: value.id } };
    dispatch(conversationActions.bulkAction(payload));
    filtersModalSheetRef.current?.dismiss({ overshootClamping: true });
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
      </Animated.View>
    </Pressable>
  );
};

const AssigneeStack = ({ agents }: { agents: Agent[] }) => {
  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} style={tailwind.style('my-1 pl-3')}>
      {agents.map((value, index) => {
        return <AssigneeCell key={index} {...{ value, lastItem: index === agents.length - 1 }} />;
      })}
    </BottomSheetScrollView>
  );
};

export const AssigneeListSheet = () => {
  const dispatch = useAppDispatch();
  const { actionsModalSheetRef } = useRefsContext();

  const agents = useAppSelector(selectAllInboxAgents);
  const selectedInboxes = useAppSelector(selectSelectedInboxes);

  const handleFocus = () => {
    actionsModalSheetRef.current?.expand();
  };
  const handleBlur = () => {
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
  };

  useEffect(() => {
    dispatch(inboxAgentActions.fetchInboxAgents({ inboxIds: selectedInboxes }));
  }, []);

  return (
    <React.Fragment>
      <SearchBar
        isInsideBottomsheet
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Search people"
      />
      <AssigneeStack agents={agents} />
    </React.Fragment>
  );
};
