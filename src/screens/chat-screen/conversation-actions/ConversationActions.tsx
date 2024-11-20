import React, { useEffect } from 'react';
import { Alert, Dimensions, Share } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import {
  AddParticipantList,
  FullWidthButton,
  MacrosList,
  OtherConversationDetails,
} from '@/components-next';
import {
  ConversationBasicActions,
  ConversationLabelActions,
  ConversationSettingsPanel,
} from './components';
import { TAB_BAR_HEIGHT } from '@/constants';
import { tailwind } from '@/theme';
import { ConversationStatus } from '@/types';
import { useChatWindowContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';

import { setActionState } from '@/store/conversation/conversationActionSlice';
import { useRefsContext } from '@/context';
import { selectSingleConversation } from '@/store/conversation/conversationSelectedSlice';
import { teamActions } from '@/store/team/teamActions';
import { selectAllTeams } from '@/store/team/teamSelectors';

const SCREEN_WIDTH = Dimensions.get('screen').width;

export type ConversationActionType = 'mute' | 'status' | 'unmute';

export const ConversationActions = () => {
  const dispatch = useAppDispatch();
  const { actionsModalSheetRef } = useRefsContext();
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const { status, muted: isMuted, meta, priority = null } = conversation || {};
  const { assignee, team } = meta || {};
  const { name = '', thumbnail = '' } = assignee || {};
  const teams = useAppSelector(selectAllTeams);

  const currentTeam = teams.find(t => t.id === team?.id) || null;

  const currentLabels = conversation?.labels || [];

  useEffect(() => {
    dispatch(teamActions.fetchTeams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onShareConversation = async () => {
    try {
      const result = await Share.share({
        // * Replace it with the current conversation URL
        url: 'https://staging.chatwoot.com/app/accounts/51/conversations/20',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const updateConversationStatus = (type: ConversationActionType, status?: ConversationStatus) => {
    if (type === 'mute') {
      dispatch(conversationActions.muteConversation({ conversationId }));
    } else if (type === 'unmute') {
      dispatch(conversationActions.unmuteConversation({ conversationId }));
    } else {
      dispatch(
        conversationActions.toggleConversationStatus({
          conversationId,
          payload: { status: status as ConversationStatus, snoozed_until: null },
        }),
      );
    }
  };

  const onChangeAssignee = () => {
    if (!conversation) return;
    dispatch(selectSingleConversation(conversation));
    dispatch(setActionState('Assign'));
    actionsModalSheetRef.current?.present();
  };

  const onChangeTeamAssignee = () => {
    if (!conversation) return;
    dispatch(selectSingleConversation(conversation));
    dispatch(setActionState('TeamAssign'));
    actionsModalSheetRef.current?.present();
  };

  return (
    <Animated.View style={tailwind.style('', `w-[${SCREEN_WIDTH}px]`)}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
        <ConversationBasicActions
          status={status}
          updateConversationStatus={updateConversationStatus}
          isMuted={isMuted || false}
        />
        <Animated.View style={tailwind.style('pt-10')}>
          <ConversationSettingsPanel
            name={name || ''}
            thumbnail={thumbnail || ''}
            teamName={currentTeam?.name || ''}
            priority={priority}
            onChangeAssignee={onChangeAssignee}
            onChangeTeamAssignee={onChangeTeamAssignee}
          />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <ConversationLabelActions labels={currentLabels} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <AddParticipantList />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <MacrosList />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <OtherConversationDetails />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <FullWidthButton handlePress={onShareConversation} text="Share conversation" />
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};
