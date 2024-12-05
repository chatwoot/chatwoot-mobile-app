import React, { useEffect } from 'react';
import { Alert, Dimensions, Share } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { Button } from '@/components-next';
import {
  ConversationBasicActions,
  ConversationLabelActions,
  ConversationSettingsPanel,
  AddParticipantList,
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
import { selectInstallationUrl } from '@/store/settings/settingsSelectors';

const SCREEN_WIDTH = Dimensions.get('screen').width;

export type ConversationActionType = 'mute' | 'status' | 'unmute';

export const ConversationActions = () => {
  const dispatch = useAppDispatch();
  const { actionsModalSheetRef } = useRefsContext();
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const installationUrl = useAppSelector(selectInstallationUrl);

  const { status, muted: isMuted, meta, priority = null } = conversation || {};
  const { assignee, team } = meta || {};
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
        url: `${installationUrl}app/accounts/${conversation?.accountId}/conversations/${conversation?.id}`,
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
    } catch (error) {
      Alert.alert((error as Error).message);
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
    // dispatch(setActionState('TeamAssign'));
    // actionsModalSheetRef.current?.present();
  };

  const onChangePriority = () => {
    if (!conversation) return;
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
            assignee={assignee || null}
            team={currentTeam || null}
            priority={priority || null}
            onChangeAssignee={onChangeAssignee}
            onChangeTeamAssignee={onChangeTeamAssignee}
            onChangePriority={onChangePriority}
          />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <ConversationLabelActions labels={currentLabels} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <AddParticipantList />
        </Animated.View>
        <Animated.View style={tailwind.style('px-4 pt-10')}>
          <Button variant="secondary" handlePress={onShareConversation} text="Share conversation" />
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};
