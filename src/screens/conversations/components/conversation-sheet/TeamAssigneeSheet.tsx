import React, { useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { Team } from '@/types';
import { Icon, SearchBar } from '@/components-next';

import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectSelectedIds,
  selectSelectedConversation,
} from '@/store/conversation/conversationSelectedSlice';
import { isInboxAgentFetching } from '@/store/inbox-agent/inboxAgentSelectors';
import { filterTeams } from '@/store/team/teamSelectors';
import { TickIcon } from '@/svg-icons';
import { conversationActions } from '@/store/conversation/conversationActions';
import i18n from '@/i18n';
import { showToast } from '@/helpers/ToastHelper';

type TeamAssigneeCellProps = {
  value: Team;
  lastItem: boolean;
  teamId: string | undefined;
};

const TeamAssigneeCell = (props: TeamAssigneeCellProps) => {
  const { value, lastItem, teamId } = props;
  const dispatch = useAppDispatch();

  const { actionsModalSheetRef } = useRefsContext();
  const selectedIds = useAppSelector(selectSelectedIds);
  const selectedConversation = useAppSelector(selectSelectedConversation);

  const isMultipleConversationsSelected = selectedIds.length !== 0;

  const handleAssigneePress = async () => {
    if (isMultipleConversationsSelected) {
      // const payload = { type: 'Conversation', ids: selectedIds, fields: { assignee_id: value.id } };
      // await dispatch(conversationActions.bulkAction(payload));
      // actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    } else {
      if (!selectedConversation?.id) return;
      await dispatch(
        conversationActions.assignTeam({
          conversationId: selectedConversation?.id,
          teamId: value.id === teamId ? '0' : value.id,
        }),
      );
      showToast({
        message: i18n.t('CONVERSATION.TEAM_CHANGE'),
      });
      actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    }
  };

  return (
    <Pressable onPress={handleAssigneePress} style={tailwind.style('flex flex-row items-center')}>
      {/* <Avatar name={value.name ?? ''} /> */}
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
        {teamId === value.id ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

const TeamAssigneeStack = ({ teams, teamId }: { teams: Team[]; teamId: string | undefined }) => {
  const isFetching = useAppSelector(isInboxAgentFetching);

  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} style={tailwind.style('my-1 pl-3')}>
      {isFetching ? (
        <ActivityIndicator />
      ) : (
        teams.map((value, index) => {
          return (
            <TeamAssigneeCell
              key={index}
              {...{ value, lastItem: index === teams.length - 1, teamId }}
            />
          );
        })
      )}
    </BottomSheetScrollView>
  );
};

export const TeamAssigneeSheet = () => {
  const { actionsModalSheetRef } = useRefsContext();
  const [searchTerm, setSearchTerm] = useState('');

  const teams = useAppSelector(state => filterTeams(state, searchTerm));
  const selectedConversation = useAppSelector(selectSelectedConversation);

  const teamId = selectedConversation?.meta?.team?.id;

  const handleFocus = () => {
    actionsModalSheetRef.current?.expand();
  };
  const handleBlur = () => {
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
  };

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
        placeholder="Search team"
      />
      <TeamAssigneeStack teams={teams as Team[]} teamId={teamId} />
    </React.Fragment>
  );
};
