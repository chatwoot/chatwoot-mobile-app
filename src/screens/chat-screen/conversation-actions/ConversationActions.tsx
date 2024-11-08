import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Pressable, Share } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  AddParticipantList,
  ConversationManagementList,
  FullWidthButton,
  Icon,
  LabelSection,
  MacrosList,
  OtherConversationDetails,
} from '@/components-next';
import { TAB_BAR_HEIGHT } from '@/constants';
import { LoadingIcon, MuteIcon, ResolvedIcon, SnoozedIcon } from '@/svg-icons';
import { tailwind } from '../../../theme';
import { LabelType } from '../../../types';
import { useHaptic, useScaleAnimation } from '../../../utils';

type ConversationStateType = 'mute' | 'pending' | 'snooze' | 'resolve';

type ConversationActionOptionsType = {
  backgroundActionColor: string;
  backgroundActionPressedColor: string;
  borderActionColor: string;
  actionIcon: React.JSX.Element;
  actionText: ConversationStateType;
};

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
const ACTION_WIDTH = (SCREEN_WIDTH - 32 - 12 * 3) / 4;

/* -------------------------------------------------------------------------- */
/*                         Conversation Status Options                        */
/* -------------------------------------------------------------------------- */

// * Can move it into a separate file

const conversationActionOptions: ConversationActionOptionsType[] = [
  {
    backgroundActionColor: 'bg-gray-100',
    backgroundActionPressedColor: 'bg-gray-200',
    borderActionColor: 'bg-gray-700',
    actionIcon: <MuteIcon stroke={tailwind.color('text-gray-700') as string} />,
    actionText: 'mute',
  },
  {
    backgroundActionColor: 'bg-blue-100',
    backgroundActionPressedColor: 'bg-blue-200',
    borderActionColor: 'bg-blue-700',
    actionIcon: <LoadingIcon stroke={tailwind.color('text-blue-700') as string} />,
    actionText: 'pending',
  },
  {
    backgroundActionColor: 'bg-amber-100',
    backgroundActionPressedColor: 'bg-amber-200',
    borderActionColor: 'bg-amber-700',
    actionIcon: <SnoozedIcon stroke={tailwind.color('text-amber-700') as string} />,
    actionText: 'snooze',
  },
  {
    backgroundActionColor: 'bg-green-100',
    backgroundActionPressedColor: 'bg-green-200',
    borderActionColor: 'bg-green-700',
    actionIcon: <ResolvedIcon stroke={tailwind.color('text-green-700') as string} />,
    actionText: 'resolve',
  },
];

type ConversationActionOptionProps = {
  index: number;
  conversationAction: ConversationActionOptionsType;
  conversationState: ConversationStateType;
  setConversationState: React.Dispatch<React.SetStateAction<ConversationStateType>>;
};

const ConversationActionOption = (props: ConversationActionOptionProps) => {
  const { index, conversationAction, conversationState, setConversationState } = props;

  const hapticSelection = useHaptic();

  const handleActionOptionPress = () => {
    hapticSelection?.();
    setConversationState(conversationAction.actionText);
  };
  const actionActive = useSharedValue(0);

  const { handlers, animatedStyle } = useScaleAnimation();

  useEffect(() => {
    if (conversationAction.actionText === conversationState) {
      actionActive.value = withSpring(1);
    } else {
      actionActive.value = withSpring(0);
    }
  }, [actionActive, conversationAction.actionText, conversationState]);

  const actionBorderColor = tailwind.color(conversationAction.borderActionColor) as string;

  const activeActionContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(actionActive.value, [0, 1], ['transparent', actionBorderColor]),
    };
  });

  return (
    <Animated.View
      style={[
        tailwind.style('flex-1', index !== conversationActionOptions.length - 1 ? 'mr-3' : ''),
        animatedStyle,
      ]}>
      <Pressable
        key={index}
        style={({ pressed }) => [
          tailwind.style(
            'flex items-center justify-between rounded-xl pt-7 pb-3',
            `w-[${ACTION_WIDTH}px]`,
            conversationAction.backgroundActionColor,
            pressed ? conversationAction.backgroundActionPressedColor : '',
          ),
        ]}
        onPress={handleActionOptionPress}
        {...handlers}>
        <Animated.View
          style={[
            tailwind.style('absolute inset-0 border-2 rounded-xl'),
            activeActionContainerStyle,
          ]}
        />
        <Icon icon={conversationAction.actionIcon} size={32} />
        <Animated.Text
          style={tailwind.style(
            'text-md font-inter-normal-24 leading-[17px] tracking-[0.32px] text-center pt-5 capitalize text-gray-950 ',
          )}>
          {conversationAction.actionText}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

/* -------------------------------------------------------------------------- */
/*                       Conversation Action Root Screen                      */
/* -------------------------------------------------------------------------- */

export const ConversationActions = () => {
  const [conversationState, setConversationState] = useState<ConversationStateType>('pending');

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

  return (
    <Animated.View style={tailwind.style('', `w-[${SCREEN_WIDTH}px]`)}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
        <Animated.View style={tailwind.style('flex flex-row justify-around px-4 pt-5')}>
          {conversationActionOptions.map((conversationAction, index) => (
            <ConversationActionOption
              key={index}
              conversationAction={conversationAction}
              conversationState={conversationState}
              setConversationState={setConversationState}
              index={index}
            />
          ))}
        </Animated.View>
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
