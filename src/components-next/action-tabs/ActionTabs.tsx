import React, { PropsWithChildren } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BlurView, BlurViewProps } from '@react-native-community/blur';

import { TAB_BAR_HEIGHT } from '@/constants';
import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import { Icon } from '../common';
import { clearSelection } from '@/store/conversation/selectedConversationSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectCurrentState, setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { setActionState } from '@/store/conversation/conversationActionSlice';

const ACTION_TAB_HEIGHT = 58;

const SCREEN_WIDTH = Dimensions.get('screen').width;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const tabExitSpringConfig = { damping: 20, stiffness: 360, mass: 1 };
const tabEnterSpringConfig = { damping: 30, stiffness: 360, mass: 1 };

type ActionTabBarBackgroundProps = BlurViewProps & PropsWithChildren;

const ActionMailIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <Path
      d="M16.0348 3.07212L24.8175 8.78087C25.1278 8.98259 25.283 9.08345 25.3954 9.21799C25.4949 9.33708 25.5697 9.47483 25.6153 9.62318C25.6668 9.79076 25.6668 9.97583 25.6668 10.346V18.8996C25.6668 20.8598 25.6668 21.8399 25.2854 22.5886C24.9498 23.2472 24.4144 23.7826 23.7558 24.1181C23.0071 24.4996 22.027 24.4996 20.0668 24.4996H7.9335C5.97331 24.4996 4.99322 24.4996 4.24453 24.1181C3.58596 23.7826 3.05053 23.2472 2.71497 22.5886C2.3335 21.8399 2.3335 20.8598 2.3335 18.8996V10.346C2.3335 9.97583 2.3335 9.79076 2.38503 9.62318C2.43064 9.47483 2.5054 9.33708 2.60492 9.21799C2.71734 9.08345 2.87251 8.98259 3.18285 8.78087L11.9655 3.07212M16.0348 3.07212C15.2983 2.59343 14.9301 2.35408 14.5334 2.26096C14.1827 2.17864 13.8177 2.17864 13.467 2.26096C13.0702 2.35408 12.702 2.59343 11.9655 3.07212M16.0348 3.07212L24.4629 8.5504C24.8642 8.81121 25.0648 8.94162 25.1343 9.10699C25.195 9.25151 25.195 9.41439 25.1343 9.55891C25.0648 9.72429 24.8642 9.85469 24.4629 10.1155L16.0348 15.5938C15.2983 16.0725 14.9301 16.3118 14.5334 16.4049C14.1827 16.4873 13.8177 16.4873 13.467 16.4049C13.0702 16.3118 12.702 16.0725 11.9655 15.5938L3.53742 10.1155C3.13617 9.85469 2.93555 9.72429 2.86606 9.55891C2.80534 9.41439 2.80534 9.25151 2.86606 9.10699C2.93555 8.94162 3.13617 8.81121 3.53742 8.5504L11.9655 3.07212"
      stroke="black"
      strokeOpacity="0.91"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

const ActionTabBarBackground = (props: ActionTabBarBackgroundProps) => {
  const { children, blurAmount, blurType, style } = props;

  const currentState = useAppSelector(selectCurrentState);

  const derivedAnimatedState = useDerivedValue(() =>
    currentState === 'Select'
      ? withSpring(0, tabEnterSpringConfig)
      : withSpring(1, tabExitSpringConfig),
  );

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(derivedAnimatedState.value, [0, 1], [0, TAB_BAR_HEIGHT]),
        },
      ],
    };
  });

  return Platform.OS === 'ios' ? (
    <AnimatedBlurView {...{ blurAmount, blurType }} style={[style, animatedTabBarStyle]}>
      {children}
    </AnimatedBlurView>
  ) : (
    <Animated.View style={[style, animatedTabBarStyle, styles.listShadow]}>
      {children}
    </Animated.View>
  );
};

// Extract Types from list
const ActionItem = (props: any) => {
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
  const { bottom } = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const { actionsModalSheetRef } = useRefsContext();
  const handleMarkAsReadConversations = () => {
    // setShowToast({
    //   showToast: true,
    //   toastMessage: 'Marked selected conversations as read.',
    // });
    dispatch(clearSelection());
    dispatch(setCurrentState('none'));
  };
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
      action: 'assign_labels',
      icon: <ActionMailIcon />,
      onPress: handleMarkAsReadConversations,
    },
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

  return (
    <ActionTabBarBackground
      blurAmount={25}
      blurType="light"
      style={Platform.select({
        ios: [
          tailwind.style(
            'flex flex-row rounded-[30px] items-center absolute justify-between w-[290px] px-6 py-[15px] bg-[#00000003]',
            `h-[${ACTION_TAB_HEIGHT}px] bottom-[${bottom + 8}px] left-[${
              (SCREEN_WIDTH - 290) / 2
            }px]`,
          ),
        ],
        android: [
          tailwind.style(
            'flex flex-row rounded-[30px] items-center absolute justify-between w-[290px] px-6 py-[15px] bg-white',
            `h-[${ACTION_TAB_HEIGHT}px] bottom-[${bottom + 8}px] left-[${
              (SCREEN_WIDTH - 290) / 2
            }px]`,
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
  listShadow: {
    // box-shadow: 0px 0.15000000596046448px 2px 0px #00000040;
    // box-shadow: [horizontal offset] [vertical offset] [blur radius] [optional spread radius] [color];
    shadowColor: '#00000040',
    shadowOffset: { width: 16, height: 16 },
    shadowRadius: 15,
    shadowOpacity: 0.55,
    elevation: 8,
  },
});
