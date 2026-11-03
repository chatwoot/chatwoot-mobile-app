import React, { PropsWithChildren } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { conversationActions } from '@/store/conversation/conversationActions';
import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { selectSelectedIds } from '@/store/conversation/conversationSelectedSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { ConversationStatus, StatusOptions } from '@/types';
import { CheckCircleIcon, PersonCircleGlyph, TagGlyph } from '@/svg-icons';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import i18n from '@/i18n';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BlurView, BlurViewProps } from '@react-native-community/blur';

import { useContainerWidth, useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { IOS_DESIGN, useHaptic, useScaleAnimation } from '@/utils';
import { Icon } from '../common';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { setActionState } from '@/store/conversation/conversationActionSlice';

const ACTION_TAB_HEIGHT = 58;

const tabExitSpringConfig = { damping: 20, stiffness: 360, mass: 1 };
const tabEnterSpringConfig = { damping: 30, stiffness: 360, mass: 1 };

type ActionTabBarBackgroundProps = Partial<BlurViewProps> &
  PropsWithChildren & {
    // iOS: Liquid Glass instead of the blur.
    glass?: boolean;
  };

const ActionLabelTag = () => (
  <Svg width="29" height="28" viewBox="0 0 29 28" fill="none">
    <Path
      d="M9.66665 9.33377H9.67832M6.49732 2.6776C5.2444 3.44539 3.75993 4.94146 3.01049 6.16443C1.72166 8.26762 1.97222 12.1393 3.76012 13.9272L12.7068 22.874C14.0929 24.26 14.7859 24.953 15.5851 25.2127C19.5664 26.5063 26.9508 19.5771 25.5456 15.2522C25.2859 14.4531 24.5929 13.76 23.2068 12.374L14.2601 3.42723C12.4722 1.63934 8.60051 1.38877 6.49732 2.6776ZM10.25 9.33377C10.25 9.65593 9.98882 9.9171 9.66665 9.9171C9.34449 9.9171 9.08332 9.65593 9.08332 9.33377C9.08332 9.0116 9.34449 8.75043 9.66665 8.75043C9.98882 8.75043 10.25 9.0116 10.25 9.33377Z"
      stroke="black"
      strokeOpacity="0.91"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const ActionUserIcon = () => (
  <Svg width="29" height="28" viewBox="0 0 29 28" fill="none">
    <Path
      d="M6.86913 22.6778C7.57885 21.0057 9.23586 19.833 11.1668 19.833H18.1668C20.0977 19.833 21.7547 21.0057 22.4644 22.6778M19.3335 11.083C19.3335 13.6603 17.2441 15.7497 14.6668 15.7497C12.0895 15.7497 10.0001 13.6603 10.0001 11.083C10.0001 8.50568 12.0895 6.41634 14.6668 6.41634C17.2441 6.41634 19.3335 8.50568 19.3335 11.083ZM26.3335 13.9997C26.3335 20.443 21.1101 25.6663 14.6668 25.6663C8.22347 25.6663 3.00012 20.443 3.00012 13.9997C3.00012 7.55635 8.22347 2.33301 14.6668 2.33301C21.1101 2.33301 26.3335 7.55635 26.3335 13.9997Z"
      stroke="black"
      strokeOpacity="0.91"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ActionStatusIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <Path
      d="M3.5 7.33301L17.5 7.33301M17.5 7.33301C17.5 9.26601 19.067 10.833 21 10.833C22.933 10.833 24.5 9.266 24.5 7.33301C24.5 5.40001 22.933 3.83301 21 3.83301C19.067 3.83301 17.5 5.40001 17.5 7.33301ZM10.5 21.6663L24.5 21.6663M10.5 21.6663C10.5 23.5993 8.933 25.1663 7 25.1663C5.067 25.1663 3.5 23.5993 3.5 21.6663C3.5 19.7333 5.067 18.1663 7 18.1663C8.933 18.1663 10.5 19.7333 10.5 21.6663Z"
      stroke="black"
      strokeOpacity="0.91"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
const IOS_BAR_WIDTH = 264;
const TINT = tailwind.color('blue-800') as string;
const DISABLED = tailwind.color('gray-600') as string;

// zeego's Label typings include web-only props; on iOS it only needs the section title.
const MenuLabel = DropdownMenu.Label as unknown as React.FC<{ children: string }>;

const STATUS_OPTIONS: { id: ConversationStatus; icon: string }[] = [
  { id: 'open', icon: 'tray' },
  { id: 'pending', icon: 'clock' },
  { id: 'snoozed', icon: 'moon' },
  { id: 'resolved', icon: 'checkmark.circle' },
];

type ToolbarButtonProps = {
  label: string;
  glyph: (props: { stroke?: string; strokeWidth?: number }) => JSX.Element;
  enabled: boolean;
};

// A labeled toolbar button. It has no onPress of its own: it's the trigger of a native menu.
const ToolbarButton = ({ label, glyph: Glyph, enabled }: ToolbarButtonProps) => (
  <View
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled: !enabled }}
    style={tailwind.style('h-[50px] min-w-[72px] items-center justify-center gap-1')}>
    <Icon size={22} icon={<Glyph stroke={enabled ? TINT : DISABLED} strokeWidth={1.6} />} />
    <Text
      style={[
        tailwind.style('text-[11px] leading-[13px] font-inter-medium-24'),
        { color: enabled ? TINT : DISABLED },
      ]}>
      {label}
    </Text>
  </View>
);

// iOS: a Liquid Glass toolbar like Mail's edit mode, applying to every selected conversation.
// Label and Assign open a full-height sheet with search; Status is a native menu. The buttons
// are gray and inactive until something is selected.
const IOSActionBar = ({ barLeft, bottom }: { barLeft: number; bottom: number }) => {
  const dispatch = useAppDispatch();
  const haptic = useHaptic();
  const selectedIds = useAppSelector(selectSelectedIds);
  const hasSelection = selectedIds.length > 0;

  const bulk = (payload: Record<string, unknown>) => {
    haptic?.();
    dispatch(
      conversationActions.bulkAction({ type: 'Conversation', ids: selectedIds, ...payload }),
    );
  };
  const navigation = useNavigation<NativeStackNavigationProp<TabBarExcludedScreenParamList>>();
  const openPicker = (kind: 'assign' | 'label') => {
    haptic?.();
    navigation.navigate('BulkPicker', { kind });
  };
  const setStatus = (status: ConversationStatus) => {
    bulk({ fields: { status } });
    dispatch(setCurrentState('none'));
  };

  const menu = (button: React.ReactElement, content: React.ReactNode) =>
    hasSelection ? (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <View>{button}</View>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>{content}</DropdownMenu.Content>
      </DropdownMenu.Root>
    ) : (
      button
    );

  return (
    <ActionTabBarBackground
      glass
      style={[
        tailwind.style(
          'absolute flex-row items-center justify-around rounded-full px-2',
          `h-[${ACTION_TAB_HEIGHT}px] w-[${IOS_BAR_WIDTH}px]`,
        ),
        { bottom, left: barLeft },
      ]}>
      {/* Label and Assign open a full-height sheet with search (lists can be long). */}
      <Pressable
        disabled={!hasSelection}
        onPress={() => openPicker('label')}
        style={({ pressed }) => tailwind.style('rounded-full', pressed && 'bg-blackA-A3')}>
        <ToolbarButton
          label={i18n.t('CONVERSATION.BULK.LABEL')}
          glyph={TagGlyph}
          enabled={hasSelection}
        />
      </Pressable>
      <Pressable
        disabled={!hasSelection}
        onPress={() => openPicker('assign')}
        style={({ pressed }) => tailwind.style('rounded-full', pressed && 'bg-blackA-A3')}>
        <ToolbarButton
          label={i18n.t('CONVERSATION.BULK.ASSIGN')}
          glyph={PersonCircleGlyph}
          enabled={hasSelection}
        />
      </Pressable>
      {menu(
        <ToolbarButton
          label={i18n.t('CONVERSATION.BULK.STATUS')}
          glyph={CheckCircleIcon}
          enabled={hasSelection}
        />,
        <DropdownMenu.Group>
          <MenuLabel>{i18n.t('CONVERSATION.CHANGE_STATUS')}</MenuLabel>
          {STATUS_OPTIONS.map(option => (
            <DropdownMenu.Item key={`status-${option.id}`} onSelect={() => setStatus(option.id)}>
              <DropdownMenu.ItemIcon ios={{ name: option.icon as never }} />
              <DropdownMenu.ItemTitle>
                {i18n.t(
                  `CONVERSATION.ASSIGNEE.STATUS.OPTIONS.${StatusOptions[option.id].toUpperCase()}`,
                )}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Group>,
      )}
    </ActionTabBarBackground>
  );
};

const ActionTabBarBackground = (props: ActionTabBarBackgroundProps) => {
  const { children, blurAmount, blurType, style, glass } = props;

  const currentState = useAppSelector(selectCurrentState);
  const { bottom } = useSafeAreaInsets();
  // Move far enough to hide the bar and its shadow even without a bottom tab bar
  // covering it (side tab layout on iPhone Duo).
  const hiddenOffset = bottom + 8 + ACTION_TAB_HEIGHT + 24;

  const derivedAnimatedState = useDerivedValue(() =>
    currentState === 'Select'
      ? withSpring(0, tabEnterSpringConfig)
      : withSpring(1, tabExitSpringConfig),
  );

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(derivedAnimatedState.value, [0, 1], [0, hiddenOffset]),
        },
      ],
    };
  });

  // Layout and shadow sit on the Animated.View. BlurView fills it as a
  // background, clipped to the corner radius by its own wrapper.
  if (glass) {
    return (
      <Animated.View
        style={[style, animatedTabBarStyle, useLiquidGlass ? null : styles.listShadow]}>
        {useLiquidGlass ? (
          <GlassView
            glassEffectStyle="regular"
            style={[StyleSheet.absoluteFill, { borderRadius: ACTION_TAB_HEIGHT / 2 }]}
          />
        ) : (
          <Animated.View style={tailwind.style('absolute inset-0 rounded-full overflow-hidden')}>
            <BlurView
              blurAmount={25}
              blurType="light"
              style={tailwind.style('flex-1 bg-[#00000009]')}
            />
          </Animated.View>
        )}
        {children}
      </Animated.View>
    );
  }

  return Platform.OS === 'ios' ? (
    <Animated.View style={[style, animatedTabBarStyle, styles.listShadow]}>
      <Animated.View style={tailwind.style('absolute inset-0 rounded-[30px] overflow-hidden')}>
        <BlurView {...{ blurAmount, blurType }} style={tailwind.style('flex-1 bg-[#00000009]')} />
      </Animated.View>
      {children}
    </Animated.View>
  ) : (
    <Animated.View style={[style, animatedTabBarStyle, styles.listShadow]}>
      {children}
    </Animated.View>
  );
};

type ActionItemProps = {
  actionItem: {
    action: string;
    icon: React.ReactNode;
    onPress: () => void;
  };
};

const ActionItem = (props: ActionItemProps) => {
  const { actionItem } = props;
  const { handlers, animatedStyle } = useScaleAnimation();

  const hapticSelection = useHaptic();

  const handleOnPress = () => {
    actionItem.onPress();
    hapticSelection?.();
  };
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        {...handlers}
        hitSlop={{ left: 10, right: 10, bottom: 8, top: 4 }}
        onPress={handleOnPress}
        key={actionItem.action}>
        <Icon size={28} icon={actionItem.icon} />
      </Pressable>
    </Animated.View>
  );
};

export const ActionTabs = () => {
  const { bottom, left } = useSafeAreaInsets();
  // Center within the area it's drawn in: the list pane in the split view, or the content
  // between the side insets elsewhere.
  const containerWidth = useContainerWidth();
  const barLeft = left + (containerWidth - 220) / 2;
  const dispatch = useAppDispatch();

  const { actionsModalSheetRef } = useRefsContext();

  const handleBulkChangeStatus = () => {
    dispatch(setActionState('Status'));
    actionsModalSheetRef.current?.present();
  };
  const handleBulkChangeAssignee = () => {
    dispatch(setActionState('Assign'));
    actionsModalSheetRef.current?.present();
  };
  const handleBulkSetLabels = () => {
    dispatch(setActionState('Label'));
    actionsModalSheetRef.current?.present();
  };

  const bulkSelectActions = [
    {
      action: 'change_status',
      icon: <ActionLabelTag />,
      onPress: handleBulkSetLabels,
    },
    {
      action: 'assign_agent',
      icon: <ActionUserIcon />,
      onPress: handleBulkChangeAssignee,
    },
    {
      action: 'assign_team',
      icon: <ActionStatusIcon />,
      onPress: handleBulkChangeStatus,
    },
  ];

  if (IOS_DESIGN) {
    return (
      <IOSActionBar barLeft={left + (containerWidth - IOS_BAR_WIDTH) / 2} bottom={bottom + 8} />
    );
  }

  return (
    <ActionTabBarBackground
      blurAmount={25}
      blurType="light"
      style={Platform.select({
        ios: [
          tailwind.style(
            'flex flex-row rounded-[30px] items-center absolute justify-between w-[220px] px-6 py-[15px]',
            `h-[${ACTION_TAB_HEIGHT}px] bottom-[${bottom + 8}px] left-[${barLeft}px]`,
          ),
        ],
        android: [
          tailwind.style(
            'flex flex-row rounded-[30px] items-center absolute justify-between w-[220px] px-6 py-[15px] bg-white',
            `h-[${ACTION_TAB_HEIGHT}px] bottom-[${bottom + 8}px] left-[${barLeft}px]`,
          ),
        ],
      })}>
      {bulkSelectActions.map(actionItem => {
        return <ActionItem key={actionItem.action} {...{ actionItem }} />;
      })}
    </ActionTabBarBackground>
  );
};

const styles = StyleSheet.create({
  listShadow:
    Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 10,
        shadowOpacity: 0.25,
      },
      android: {
        elevation: 4,
        backgroundColor: 'white',
      },
    }) || {}, // Add fallback empty object
});
