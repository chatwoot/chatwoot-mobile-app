import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { Agent } from '@/types';
import { Avatar, Icon, SearchBar } from '@/components-next';
import { TickIcon } from '@/svg-icons';

import { assignableAgentActions } from '@/store/assignable-agent/assignableAgentActions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAssignableParticipantsByInboxId } from '@/store/assignable-agent/assignableAgentSelectors';
import { selectSelectedConversation } from '@/store/conversation/conversationSelectedSlice';
import { isAssignableAgentFetching } from '@/store/assignable-agent/assignableAgentSelectors';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';
import { CONVERSATION_EVENTS } from '@/constants/analyticsEvents';
import AnalyticsHelper from '@/utils/analyticsUtils';
import { conversationParticipantActions } from '@/store/conversation-participant/conversationParticipantActions';

type ParticipantCellProps = {
  value: Agent & { isParticipant: boolean };
  lastItem: boolean;
  onPress: (item: Agent & { isParticipant: boolean }) => void;
};

const ParticipantCell = (props: ParticipantCellProps) => {
  const { value, lastItem, onPress } = props;

  return (
    <Pressable onPress={() => onPress(value)} style={tailwind.style('flex flex-row items-center')}>
      <Avatar src={{ uri: value.thumbnail || undefined }} name={value.name ?? ''} size="md" />
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
        {value.isParticipant ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

const ParticipantStack = ({
  allAgents,
  activeConversationParticipants,
}: {
  allAgents: Agent[];
  activeConversationParticipants: Agent[];
}) => {
  const isFetching = useAppSelector(isAssignableAgentFetching);

  const dispatch = useAppDispatch();

  const selectedConversation = useAppSelector(selectSelectedConversation);

  const updatedAgents = allAgents.map(agent => {
    return {
      ...agent,
      isParticipant: activeConversationParticipants.some(
        participant => participant.id === agent.id,
      ),
    };
  });

  const handleAssigneePress = async (item: Agent & { isParticipant: boolean }) => {
    let updateAgentList = [...activeConversationParticipants];
    if (item.isParticipant) {
      updateAgentList = updateAgentList.filter(agent => agent.id !== item.id);
    } else {
      updateAgentList.push(item);
    }
    const userIds = updateAgentList.map(agent => agent.id);
    if (selectedConversation) {
      await dispatch(
        conversationParticipantActions.update({
          conversationId: selectedConversation?.id,
          userIds,
        }),
      );
      AnalyticsHelper.track(CONVERSATION_EVENTS.PARTICIPANT_CHANGED);
      showToast({
        message: i18n.t('CONVERSATION.PARTICIPANT_CHANGE'),
      });
    }
  };

  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} style={tailwind.style('my-1 pl-3')}>
      {isFetching ? (
        <ActivityIndicator />
      ) : (
        updatedAgents.map((value, index) => {
          return (
            <ParticipantCell
              key={index}
              {...{
                value,
                lastItem: index === updatedAgents.length - 1,
                onPress: handleAssigneePress,
              }}
            />
          );
        })
      )}
    </BottomSheetScrollView>
  );
};

type UpdateParticipantProps = {
  activeConversationParticipants: Agent[];
};

export const UpdateParticipant = (props: UpdateParticipantProps) => {
  const { activeConversationParticipants } = props;
  const dispatch = useAppDispatch();
  const { updateParticipantSheetRef } = useRefsContext();
  const [searchTerm, setSearchTerm] = useState('');

  const selectedConversation = useAppSelector(selectSelectedConversation);

  const inboxId = selectedConversation?.inboxId;

  const inboxIds = inboxId ? [inboxId] : [];

  const selectAgents = useAppSelector(selectAssignableParticipantsByInboxId);
  const allAgents = inboxId ? selectAgents(inboxId, searchTerm) : [];

  const handleFocus = () => {
    updateParticipantSheetRef.current?.expand();
  };
  const handleBlur = () => {
    updateParticipantSheetRef.current?.dismiss({ overshootClamping: true });
  };

  useEffect(() => {
    dispatch(assignableAgentActions.fetchAgents({ inboxIds }));
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
      <ParticipantStack
        allAgents={allAgents}
        activeConversationParticipants={activeConversationParticipants}
      />
    </React.Fragment>
  );
};
