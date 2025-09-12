import React, { useEffect } from 'react';
import { Alert, Dimensions, Platform, Share } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

import { BottomSheetBackdrop, Button } from '@/components-next';
import {
  ConversationBasicActions,
  ConversationLabelActions,
  ConversationSettingsPanel,
  AddParticipantList,
  UpdateParticipant,
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
import { ConversationMetaInformation } from './components/ConversationMetaInformation';
import { selectConversationParticipantsByConversationId } from '@/store/conversation-participant/conversationParticipantSelectors';

const SCREEN_WIDTH = Dimensions.get('screen').width;

export type ConversationActionType = 'mute' | 'status' | 'unmute';

export const ConversationActions = () => {
  const dispatch = useAppDispatch();
  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });
  const { updateParticipantSheetRef, actionsModalSheetRef } = useRefsContext();
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const installationUrl = useAppSelector(selectInstallationUrl);

  const { status, muted: isMuted, meta, priority = null } = conversation || {};
  const { assignee, team } = meta || {};
  const teams = useAppSelector(selectAllTeams);

  const currentTeam = teams.find(t => t.id === team?.id) || null;

  const currentLabels = conversation?.labels || [];

  const conversationParticipants = useAppSelector(state =>
    selectConversationParticipantsByConversationId(state, conversationId),
  );

  useEffect(() => {
    dispatch(teamActions.fetchTeams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onShareConversation = async () => {
    try {
      const url = `${installationUrl}app/accounts/${conversation?.accountId}/conversations/${conversation?.id}`;

      const message = Platform.OS === 'android' ? url : '';

      await Share.share({
        message,
        url,
      });
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
    dispatch(setActionState('TeamAssign'));
    actionsModalSheetRef.current?.present();
  };

  const onChangePriority = () => {
    if (!conversation) return;
    dispatch(selectSingleConversation(conversation));
    dispatch(setActionState('Priority'));
    actionsModalSheetRef.current?.present();
  };

  const onAddParticipant = () => {
    if (!conversation) return;
    dispatch(selectSingleConversation(conversation));
    updateParticipantSheetRef.current?.present();
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
          <AddParticipantList
            conversationParticipants={conversationParticipants}
            onAddParticipant={onAddParticipant}
          />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          {conversation && <ConversationMetaInformation conversation={conversation} />}
        </Animated.View>
        <Animated.View style={tailwind.style('px-4 pt-10')}>
          <Button variant="secondary" handlePress={onShareConversation} text="Share conversation" />
        </Animated.View>
      </ScrollView>
      <BottomSheetModal
        ref={updateParticipantSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        animationConfigs={animationConfigs}
        enablePanDownToClose
        snapPoints={['50%']}>
        <UpdateParticipant activeConversationParticipants={conversationParticipants} />
      </BottomSheetModal>
    </Animated.View>
  );
};
