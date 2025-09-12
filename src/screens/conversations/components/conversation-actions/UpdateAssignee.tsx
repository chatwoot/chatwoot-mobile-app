import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { Agent } from '@/types';
import { Avatar, Icon, SearchBar } from '@/components-next';
import { SelfAssign, TickIcon } from '@/svg-icons';

import { assignableAgentActions } from '@/store/assignable-agent/assignableAgentActions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAssignableAgentsByInboxId } from '@/store/assignable-agent/assignableAgentSelectors';
import {
  selectSelectedIds,
  selectSelectedInboxes,
  selectSelectedConversation,
} from '@/store/conversation/conversationSelectedSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { isAssignableAgentFetching } from '@/store/assignable-agent/assignableAgentSelectors';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';
import { CONVERSATION_EVENTS } from '@/constants/analyticsEvents';
import AnalyticsHelper from '@/utils/analyticsUtils';
import { selectUserId } from '@/store/auth/authSelectors';

type AssigneeCellProps = {
  agent: Agent;
  lastItem: boolean;
  assigneeId: number | undefined;
  onPress: () => void;
};

const AssigneeCell = (props: AssigneeCellProps) => {
  const { agent, lastItem, assigneeId } = props;

  return (
    <Pressable onPress={props.onPress} style={tailwind.style('flex flex-row items-center')}>
      <Avatar src={{ uri: agent.thumbnail || undefined }} name={agent.name ?? ''} size="md" />
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
          {agent.name}
        </Animated.Text>
        {assigneeId === agent.id ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

export const UpdateAssignee = () => {
  const dispatch = useAppDispatch();
  const { actionsModalSheetRef } = useRefsContext();
  const [searchTerm, setSearchTerm] = useState('');

  const selectedInboxes = useAppSelector(selectSelectedInboxes);
  const selectedConversation = useAppSelector(selectSelectedConversation);
  const selectedIds = useAppSelector(selectSelectedIds);

  const inboxId = selectedConversation?.inboxId;

  const inboxIds = inboxId ? [inboxId] : selectedInboxes;

  const agents = useAppSelector(state =>
    selectAssignableAgentsByInboxId(state, inboxIds, searchTerm),
  );

  const assigneeId = selectedConversation?.meta?.assignee?.id;

  const userId = useAppSelector(selectUserId);

  const isSelfAssign = assigneeId === userId;

  const isMultipleConversationsSelected = selectedIds.length !== 0;

  const isFetching = useAppSelector(isAssignableAgentFetching);

  const handleFocus = () => {
    actionsModalSheetRef.current?.expand();
  };
  const handleBlur = () => {
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
  };

  useEffect(() => {
    dispatch(assignableAgentActions.fetchAgents({ inboxIds }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeText = (text: string) => {
    setSearchTerm(text);
  };

  const handleAssigneePress = async (agent: Agent) => {
    if (isMultipleConversationsSelected) {
      const payload = { type: 'Conversation', ids: selectedIds, fields: { assignee_id: agent.id } };
      await dispatch(conversationActions.bulkAction(payload));
      actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    } else {
      if (!selectedConversation?.id) return;
      await dispatch(
        conversationActions.assignConversation({
          conversationId: selectedConversation?.id,
          assigneeId: agent.id === assigneeId ? 0 : agent.id,
        }),
      );
      AnalyticsHelper.track(CONVERSATION_EVENTS.ASSIGNEE_CHANGED);
      showToast({
        message: i18n.t('CONVERSATION.ASSIGN_CHANGE'),
      });
      actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    }
  };

  const selfAgent = agents.find(agent => agent.id === userId);

  return (
    <React.Fragment>
      <SearchBar
        isInsideBottomSheet
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={handleChangeText}
        placeholder={i18n.t('CONVERSATION.ASSIGNEE.AGENTS.SEARCH_AGENT')}
      />

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        style={tailwind.style('my-1 pl-3')}>
        {isFetching ? (
          <ActivityIndicator />
        ) : (
          <>
            {!isSelfAssign && (
              <Pressable
                style={tailwind.style('flex flex-row items-center')}
                onPress={() => handleAssigneePress(selfAgent as Agent)}>
                <Animated.View style={tailwind.style('p-0.5')}>
                  <Icon icon={<SelfAssign />} size={24} />
                </Animated.View>
                <Animated.View
                  style={tailwind.style(
                    'flex-1 ml-3 flex-row justify-between py-[11px] pr-3 border-b-[1px] border-blackA-A3',
                  )}>
                  <Animated.Text
                    style={[
                      tailwind.style(
                        'text-base text-blue-800 font-inter-420-20 leading-[21px] tracking-[0.16px]',
                      ),
                    ]}>
                    {i18n.t('CONVERSATION.SELF_ASSIGN')}
                  </Animated.Text>
                </Animated.View>
              </Pressable>
            )}

            {agents.map((agent, index) => {
              return (
                <AssigneeCell
                  key={agent.id}
                  {...{ agent: agent as Agent, lastItem: index === agents.length - 1, assigneeId }}
                  onPress={() => handleAssigneePress(agent as Agent)}
                />
              );
            })}
          </>
        )}
      </BottomSheetScrollView>
    </React.Fragment>
  );
};
