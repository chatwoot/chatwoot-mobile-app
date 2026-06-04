import React, { PropsWithChildren } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView, BlurViewProps } from '@react-native-community/blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { selectCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { useAppSelector } from '@/hooks';

import {
  Bolt,
  ContactsIcon,
  ConversationIconFilled,
  ConversationIconOutline,
  InboxIconFilled,
  InboxIconOutline,
  PhoneIcon,
} from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation, useTabBarHeight } from '@/utils';

import { TabParamList } from './AppTabs';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const tabExitSpringConfig = { damping: 20, stiffness: 360, mass: 1 };
const tabEnterSpringConfig = { damping: 30, stiffness: 360, mass: 1 };

type TabBarIconsProps = {
  focused: boolean;
  route: RouteProp<TabParamList, keyof TabParamList>;
};

type TabRoute = RouteProp<TabParamList, keyof TabParamList>;

type TabItemProps = {
  options: BottomTabBarProps['descriptors'][string]['options'];
  onPress: () => void;
  onLongPress: () => void;
  route: TabRoute;
  isFocused: boolean;
};

const TabBarIcons = ({ focused, route }: TabBarIconsProps) => {
  const iconColor = focused ? tailwind.color('text-gray-950') : tailwind.color('text-gray-700');

  switch (route.name) {
    case 'Inbox':
      return focused ? (
        <InboxIconFilled stroke={iconColor} />
      ) : (
        <InboxIconOutline stroke={iconColor} />
      );
    case 'Contacts':
      return <ContactsIcon stroke={iconColor} />;
    case 'Dial':
      return <PhoneIcon stroke={iconColor} />;
    case 'Channels':
      return focused ? (
        <ConversationIconFilled fill={iconColor} />
      ) : (
        <ConversationIconOutline stroke={iconColor} />
      );
    case 'More':
      return (
        <View style={tailwind.style('h-6 w-6')}>
          <Bolt stroke={iconColor} />
        </View>
      );
  }
};

type TabBarBackgroundProps = BlurViewProps & PropsWithChildren;

const TabBarBackground = (props: TabBarBackgroundProps) => {
  const { children, style, blurAmount, blurType } = props;

  const currentState = useAppSelector(selectCurrentState);

  const tabBarHeight = useTabBarHeight();

  const derivedAnimatedState = useDerivedValue(() =>
    currentState === 'Select'
      ? withSpring(1, tabExitSpringConfig)
      : withSpring(0, tabEnterSpringConfig),
  );

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(derivedAnimatedState.value, [0, 1], [0, tabBarHeight]),
        },
      ],
    };
  });

  return Platform.OS === 'ios' ? (
    <AnimatedBlurView {...{ blurAmount, blurType }} style={[style, animatedTabBarStyle]}>
      {children}
    </AnimatedBlurView>
  ) : (
    <Animated.View style={[style, animatedTabBarStyle]}>{children}</Animated.View>
  );
};

const TabItem = (props: TabItemProps) => {
  const { handlers, animatedStyle } = useScaleAnimation();

  const { onPress, onLongPress, isFocused, options, route } = props;

  // Memoize hitSlop to prevent new object reference on every render
  const hitSlop = React.useMemo(() => ({ top: 2, left: 10, right: 10, bottom: 10 }), []);

  // Use stable object reference for accessibilityState when not focused
  const accessibilityState = React.useMemo(
    () => (isFocused ? { selected: true } : {}),
    [isFocused],
  );

  const iconStyle = React.useMemo(() => tailwind.style('h-8 w-8 items-center justify-center'), []);

  return (
    <Animated.View
      style={[tailwind.style('justify-center items-center flex-1 bg-transparent'), animatedStyle]}>
      <Pressable
        hitSlop={hitSlop}
        {...handlers}
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={tailwind.style('h-16 flex-1 items-center justify-center')}>
        <Animated.View style={iconStyle}>
          <TabBarIcons focused={isFocused} route={route} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const BottomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const hapticSelection = useHaptic();
  const tabBarHeight = useTabBarHeight();

  // Memoize press handlers using useCallback
  const createPressHandler = React.useCallback(
    (route: TabRoute, isFocused: boolean) => {
      return () => {
        hapticSelection?.();
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          if (route.name === 'Channels') {
            navigation.navigate(route.name, {
              screen: 'ConversationScreen',
              params: { showFilters: true },
            });
            return;
          }

          navigation.navigate(route.name, route.params);
        }
      };
    },
    [hapticSelection, navigation],
  );

  // Memoize long press handler
  const createLongPressHandler = React.useCallback(
    (route: TabRoute) => {
      return () => {
        navigation.emit({
          type: 'tabLongPress',
          target: route.key,
        });
      };
    },
    [navigation],
  );

  return (
    <TabBarBackground
      blurAmount={25}
      blurType="light"
      style={Platform.select({
        ios: [
          tailwind.style(
            'flex flex-row absolute w-full bottom-0 px-3 pt-[8px] pb-8 bg-[#00000009]',
            `h-[${tabBarHeight}px]`,
          ),
        ],
        android: [
          tailwind.style(
            'flex flex-row absolute w-full bottom-0 px-3 py-[8px] bg-white',
            `h-[${tabBarHeight}px]`,
          ),
        ],
      })}>
      <Animated.View style={tailwind.style('absolute inset-0 h-[1px] bg-blackA-A3')} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        return (
          <TabItem
            key={route.key}
            options={options}
            onPress={createPressHandler(route as TabRoute, isFocused)}
            onLongPress={createLongPressHandler(route as TabRoute)}
            route={route as TabRoute}
            isFocused={isFocused}
          />
        );
      })}
    </TabBarBackground>
  );
};
