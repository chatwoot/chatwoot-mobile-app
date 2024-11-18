import React from 'react';
import { Alert, Dimensions, Share } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import {
  AddParticipantList,
  ConversationManagementList,
  FullWidthButton,
  LabelSection,
  MacrosList,
  OtherConversationDetails,
} from '@/components-next';
import { ConversationBasicActions } from './components';
import { TAB_BAR_HEIGHT } from '@/constants';
import { tailwind } from '@/theme';
import { ConversationStatus, LabelType } from '@/types';
import { useChatWindowContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';

const currentLabels: LabelType[] = [
  {
    labelColor: 'bg-indigo-800',
    labelText: 'Billing',
  },
  {
    labelColor: 'bg-red-800',
    labelText: 'Bug',
  },
  {
    labelColor: 'bg-green-800',
    labelText: 'Lead',
  },
];

const SCREEN_WIDTH = Dimensions.get('screen').width;

export type ConversationActionType = 'mute' | 'status' | 'unmute';

export const ConversationActions = () => {
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const status = conversation?.status;
  const isMuted = conversation?.muted;
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
          <ConversationManagementList />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <LabelSection labelList={currentLabels} />
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
