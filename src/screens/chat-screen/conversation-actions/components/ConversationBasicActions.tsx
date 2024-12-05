import React, { useEffect } from 'react';
import { Dimensions, Pressable } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon } from '@/components-next';
import { MuteIcon, ResolvedFilledIcon, SnoozedFilledIcon, PendingFilledIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import { ConversationStatus } from '@/types';

import { ConversationActionType } from '../ConversationActions';

type ConversationStateType = 'mute' | 'pending' | 'snooze' | 'resolve';

type ConversationActionOptionsType = {
  backgroundActionColor: string;
  backgroundActionPressedColor: string;
  borderActionColor: string;
  actionIcon: React.JSX.Element;
  actionText: ConversationStateType;
  actionStatus: ConversationStatus | 'muted';
};

const SCREEN_WIDTH = Dimensions.get('screen').width;
const ACTION_WIDTH = (SCREEN_WIDTH - 32 - 12 * 3) / 4;

const conversationActionOptions: ConversationActionOptionsType[] = [
  {
    backgroundActionColor: 'bg-gray-100',
    backgroundActionPressedColor: 'bg-gray-200',
    borderActionColor: 'bg-gray-700',
    actionIcon: <MuteIcon stroke={tailwind.color('text-gray-700') as string} />,
    actionText: 'mute',
    actionStatus: 'muted',
  },
  {
    backgroundActionColor: 'bg-amber-100',
    backgroundActionPressedColor: 'bg-amber-200',
    borderActionColor: 'bg-amber-700',
    actionIcon: <PendingFilledIcon />,
    actionText: 'pending',
    actionStatus: 'pending',
  },
  {
    backgroundActionColor: 'bg-indigo-100',
    backgroundActionPressedColor: 'bg-indigo-200',
    borderActionColor: 'bg-indigo-700',
    actionIcon: <SnoozedFilledIcon />,
    actionText: 'snooze',
    actionStatus: 'snoozed',
  },
  {
    backgroundActionColor: 'bg-green-100',
    backgroundActionPressedColor: 'bg-green-200',
    borderActionColor: 'bg-green-700',
    actionIcon: <ResolvedFilledIcon />,
    actionText: 'resolve',
    actionStatus: 'resolved',
  },
];

type ConversationActionOptionProps = {
  index: number;
  conversationAction: ConversationActionOptionsType;
  status: ConversationStatus | undefined;
  isMuted: boolean | false;
  updateConversationStatus: (type: ConversationActionType, status?: ConversationStatus) => void;
};

const ConversationActionOption = (props: ConversationActionOptionProps) => {
  const { index, conversationAction, status, updateConversationStatus, isMuted } = props;

  const hapticSelection = useHaptic();

  const handleActionOptionPress = () => {
    hapticSelection?.();
    if (conversationAction.actionText === 'mute') {
      updateConversationStatus(isMuted ? 'unmute' : 'mute');
    } else {
      updateConversationStatus('status', conversationAction.actionStatus as ConversationStatus);
    }
  };
  const actionActive = useSharedValue(0);

  const { handlers, animatedStyle } = useScaleAnimation();

  useEffect(() => {
    if (
      conversationAction.actionStatus === status ||
      (conversationAction.actionText === 'mute' && isMuted)
    ) {
      actionActive.value = withSpring(1);
    } else {
      actionActive.value = withSpring(0);
    }
  }, [
    actionActive,
    conversationAction.actionStatus,
    conversationAction.actionText,
    status,
    isMuted,
  ]);

  const actionBorderColor = tailwind.color(conversationAction.borderActionColor) as string;

  const activeActionContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(actionActive.value, [0, 1], ['transparent', actionBorderColor]),
    };
  });

  const actionText =
    conversationAction.actionText === 'mute'
      ? isMuted
        ? 'unmute'
        : 'mute'
      : conversationAction.actionText;

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
          {actionText}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

type ConversationBasicActionsProps = {
  status: ConversationStatus | undefined;
  updateConversationStatus: (type: ConversationActionType, status?: ConversationStatus) => void;
  isMuted: boolean | false;
};

export const ConversationBasicActions = (props: ConversationBasicActionsProps) => {
  const { status, updateConversationStatus, isMuted } = props;

  return (
    <Animated.View style={tailwind.style('flex flex-row justify-around px-4 pt-5')}>
      {conversationActionOptions.map((conversationAction, index) => (
        <ConversationActionOption
          key={index}
          conversationAction={conversationAction}
          status={status}
          isMuted={isMuted}
          updateConversationStatus={updateConversationStatus}
          index={index}
        />
      ))}
    </Animated.View>
  );
};
