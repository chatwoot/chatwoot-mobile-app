import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon } from '@/components-next';
import {
  StatusOpenIcon,
  StatusResolvedIcon,
  PendingFilledIcon,
  SnoozedFilledIcon,
} from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useHaptic, useScaleAnimation } from '@/utils';
import { ConversationStatus } from '@/types';

import { ConversationActionType } from '../ConversationActions';
import { useContainerWidth } from '@/context';
import { usePaneRightInset } from '@/navigation/split/usePaneRightInset';
import { useIsInDetailPane } from '@/navigation/split/SplitViewContext';

type ConversationActionOptionsType = {
  backgroundActionColor: string;
  backgroundActionPressedColor: string;
  borderActionColor: string;
  actionIcon: React.JSX.Element;
  // Native height of icons drawn at a fixed size, so the compact row can scale them to fit.
  iconNativeSize?: number;
  actionStatus: ConversationStatus | 'open';
};

const conversationActionOptions: ConversationActionOptionsType[] = [
  {
    backgroundActionColor: 'bg-gray-100',
    backgroundActionPressedColor: 'bg-gray-200',
    borderActionColor: 'bg-gray-700',
    actionIcon: <StatusOpenIcon />,
    actionStatus: 'open',
  },
  {
    backgroundActionColor: 'bg-amber-100',
    backgroundActionPressedColor: 'bg-amber-200',
    borderActionColor: 'bg-amber-700',
    actionIcon: <PendingFilledIcon />,
    iconNativeSize: 32,
    actionStatus: 'pending',
  },
  {
    backgroundActionColor: 'bg-indigo-100',
    backgroundActionPressedColor: 'bg-indigo-200',
    borderActionColor: 'bg-indigo-700',
    actionIcon: <SnoozedFilledIcon />,
    iconNativeSize: 32,
    actionStatus: 'snoozed',
  },
  {
    backgroundActionColor: 'bg-green-100',
    backgroundActionPressedColor: 'bg-green-200',
    borderActionColor: 'bg-green-700',
    actionIcon: <StatusResolvedIcon />,
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
  const ACTION_WIDTH = (useContainerWidth() - usePaneRightInset() - 32 - 12 * 3) / 4;
  const { index, conversationAction, status, updateConversationStatus, isMuted } = props;

  const hapticSelection = useHaptic();

  const handleActionOptionPress = () => {
    hapticSelection?.();
    updateConversationStatus('status', conversationAction.actionStatus as ConversationStatus);
  };
  const actionActive = useSharedValue(0);

  const { handlers, animatedStyle } = useScaleAnimation();
  const isInPane = useIsInDetailPane();

  useEffect(() => {
    if (conversationAction.actionStatus === status) {
      actionActive.value = withSpring(1);
    } else {
      actionActive.value = withSpring(0);
    }
  }, [actionActive, conversationAction.actionStatus, status, isMuted]);

  const actionBorderColor = tailwind.color(conversationAction.borderActionColor) as string;

  const activeActionContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(actionActive.value, [0, 1], ['transparent', actionBorderColor]),
    };
  });

  // Split view pane (iOS style): a compact 44pt row of buttons with the icon and label
  // inline. White when not selected; the current status fills with its color.
  if (isInPane) {
    const isActive = conversationAction.actionStatus === status;
    return (
      <Animated.View
        style={[
          tailwind.style('flex-1', index !== conversationActionOptions.length - 1 ? 'mr-1.5' : ''),
          animatedStyle,
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          style={({ pressed }) =>
            tailwind.style(
              'h-11 flex-row items-center justify-center gap-1 rounded-[10px] px-1',
              isActive
                ? conversationAction.backgroundActionColor
                : pressed
                  ? 'bg-gray-100'
                  : 'bg-white',
            )
          }
          onPress={handleActionOptionPress}
          {...handlers}>
          {conversationAction.iconNativeSize ? (
            // Fixed-size icon: scale it down into the 18pt slot.
            <View style={tailwind.style('h-[18px] w-[18px] items-center justify-center')}>
              <View style={{ transform: [{ scale: 18 / conversationAction.iconNativeSize }] }}>
                {conversationAction.actionIcon}
              </View>
            </View>
          ) : (
            <Icon icon={conversationAction.actionIcon} size={18} />
          )}
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'flex-shrink text-[15px] leading-[20px] font-inter-medium-24 text-gray-950 capitalize',
            )}>
            {i18n.t(`CONVERSATION_ACTION.OPTIONS.${conversationAction.actionStatus.toUpperCase()}`)}
          </Animated.Text>
        </Pressable>
      </Animated.View>
    );
  }

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
            'text-md font-inter-normal-20 leading-[17px] tracking-[0.32px] text-center pt-5 capitalize text-gray-950 ',
          )}>
          {i18n.t(`CONVERSATION_ACTION.OPTIONS.${conversationAction.actionStatus.toUpperCase()}`)}
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
