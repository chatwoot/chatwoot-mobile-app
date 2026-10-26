import React, { PropsWithChildren } from 'react';
import { Platform, Pressable } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView, BlurViewProps } from '@react-native-community/blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { selectCurrentState } from '@/store/conversation/conversationHeaderSlice';

import {
  ConversationIconFilled,
  ConversationIconOutline,
  InboxIconFilled,
  InboxIconOutline,
  SettingsIconFilled,
  SettingsIconOutline,
} from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation, useSideTabBarLayout, useTabBarHeight } from '@/utils';
import { SIDE_STATUS_BAR_CLEARANCE, SIDE_TAB_BAR_WIDTH } from '@/constants';
import { useSideToolbarItems } from '@/context';

import { TabParamList } from './AppTabs';
import { useAppSelector } from '@/hooks';

const tabExitSpringConfig = { damping: 20, stiffness: 360, mass: 1 };
const tabEnterSpringConfig = { damping: 30, stiffness: 360, mass: 1 };

type TabBarIconsProps = {
  focused: boolean;
  route: RouteProp<TabParamList, keyof TabParamList>;
  // Centered 24pt glyph for the round buttons of the side tab bar.
  compact?: boolean;
};

const TabBarIcons = ({ focused, route, compact }: TabBarIconsProps) => {
  switch (route.name) {
    case 'Conversations':
      return focused ? (
        <ConversationIconFilled compact={compact} />
      ) : (
        <ConversationIconOutline compact={compact} />
      );
    case 'Inbox':
      return focused ? (
        <InboxIconFilled compact={compact} />
      ) : (
        <InboxIconOutline compact={compact} />
      );
    case 'Settings':
      return focused ? (
        <SettingsIconFilled compact={compact} />
      ) : (
        <SettingsIconOutline compact={compact} />
      );
  }
};

type TabBarBackgroundProps = BlurViewProps & PropsWithChildren & { capsule?: boolean };

// Soft lift for the floating side capsules (iPhone Duo).
// Side capsules use the system Liquid Glass material when iOS supports it. Glass draws
// its own edge and depth; older iOS versions fall back to a blur with a hairline border
// and a soft shadow.
const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

const capsuleShadow = useLiquidGlass
  ? null
  : {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      shadowOpacity: 0.08,
    };

const capsuleBorder = useLiquidGlass ? '' : 'border border-blackA-A3';

// Background of a side capsule. The blur is clipped by its own wrapper so the capsule
// itself can draw a shadow.
const CapsuleFill = ({ blurAmount, blurType }: BlurViewProps) =>
  useLiquidGlass ? (
    <GlassView
      glassEffectStyle="regular"
      isInteractive
      style={[tailwind.style('absolute inset-0'), { borderRadius: SIDE_TAB_BAR_WIDTH / 2 }]}
    />
  ) : (
    <Animated.View style={tailwind.style('absolute inset-0 rounded-full overflow-hidden')}>
      <BlurView {...{ blurAmount, blurType }} style={tailwind.style('flex-1 bg-white')} />
    </Animated.View>
  );

const TabBarBackground = (props: TabBarBackgroundProps) => {
  const { children, style, blurAmount, blurType, capsule } = props;

  const currentState = useAppSelector(selectCurrentState);

  const tabBarHeight = useTabBarHeight();
  const sideTabBar = useSideTabBarLayout();
  // How far the side capsule moves to leave the screen, signed toward its edge.
  const sideExitDistance = sideTabBar
    ? (sideTabBar.offset + SIDE_TAB_BAR_WIDTH) * (sideTabBar.edge === 'right' ? 1 : -1)
    : 0;

  const derivedAnimatedState = useDerivedValue(() =>
    currentState === 'Select'
      ? withSpring(1, tabExitSpringConfig)
      : withSpring(0, tabEnterSpringConfig),
  );

  // Select mode slides the bar out of view: down for the bottom bar, sideways off
  // its edge for the side capsule.
  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      transform: sideTabBar
        ? [
            {
              translateX: interpolate(derivedAnimatedState.value, [0, 1], [0, sideExitDistance]),
            },
          ]
        : [
            {
              translateY: interpolate(derivedAnimatedState.value, [0, 1], [0, tabBarHeight]),
            },
          ],
    };
  });

  // BlurView does not reliably apply flex/positioning styles under the New
  // Architecture, so the layout lives on a plain Animated.View and BlurView is
  // only an absolute-fill background behind the tab items.
  return Platform.OS === 'ios' ? (
    capsule ? (
      <Animated.View style={[style, animatedTabBarStyle, capsuleShadow]}>
        <CapsuleFill {...{ blurAmount, blurType }} />
        {children}
      </Animated.View>
    ) : (
      <Animated.View style={[style, animatedTabBarStyle]}>
        <BlurView
          {...{ blurAmount, blurType }}
          style={tailwind.style('absolute inset-0 bg-white')}
        />
        {children}
      </Animated.View>
    )
  ) : (
    <Animated.View style={[style, animatedTabBarStyle]}>{children}</Animated.View>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabItem = (props: any) => {
  const { handlers, animatedStyle } = useScaleAnimation();

  const { onPress, onLongPress, isFocused, options, route, vertical } = props;

  // Memoize hitSlop to prevent new object reference on every render
  const hitSlop = React.useMemo(() => ({ top: 2, left: 10, right: 10, bottom: 10 }), []);

  // Use stable object reference for accessibilityState when not focused
  const accessibilityState = React.useMemo(
    () => (isFocused ? { selected: true } : {}),
    [isFocused],
  );
  return (
    <Animated.View
      style={[
        tailwind.style(
          'justify-center items-center',
          // In the side capsule the selected tab gets a soft circle, like system side tab bars.
          vertical
            ? `h-11 w-11 rounded-full ${isFocused ? 'bg-blackA-A3' : 'bg-transparent'}`
            : 'flex-1 bg-transparent',
        ),
        animatedStyle,
      ]}>
      <Pressable
        hitSlop={hitSlop}
        {...handlers}
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        // In the side capsule the whole round button is the tap target.
        style={vertical ? tailwind.style('h-11 w-11 items-center justify-center') : undefined}
        onPress={onPress}
        onLongPress={onLongPress}>
        <TabBarIcons focused={isFocused} route={route} compact={vertical} />
      </Pressable>
    </Animated.View>
  );
};

export const BottomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const hapticSelection = useHaptic();
  const tabBarHeight = useTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  const sideTabBar = useSideTabBarLayout();
  const sideToolbarItems = useSideToolbarItems();

  // Memoize press handlers using useCallback
  const createPressHandler = React.useCallback(
    (route: { key: string; name: string; params?: object }, isFocused: boolean) => {
      return () => {
        hapticSelection?.();
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      };
    },
    [hapticSelection, navigation],
  );

  // Memoize long press handler
  const createLongPressHandler = React.useCallback(
    (route: { key: string; name: string; params?: object }) => {
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
    <>
      {sideTabBar && sideToolbarItems ? (
        // Header actions of the focused screen, at the top of the side column below
        // the status bar (iPhone Duo).
        <Animated.View
          style={[
            tailwind.style(
              'absolute flex flex-col items-center py-1 gap-1 rounded-full',
              capsuleBorder,
              `w-[${SIDE_TAB_BAR_WIDTH}px] top-[${SIDE_STATUS_BAR_CLEARANCE}px]`,
            ),
            sideTabBar.edge === 'right'
              ? { right: sideTabBar.offset }
              : { left: sideTabBar.offset },
            capsuleShadow,
          ]}>
          <CapsuleFill blurAmount={25} blurType="light" />
          {sideToolbarItems}
        </Animated.View>
      ) : null}
      <TabBarBackground
        blurAmount={25}
        blurType="light"
        capsule={!!sideTabBar}
        style={Platform.select({
          ios: sideTabBar
            ? [
                // Floating capsule on the status bar side (iPhone Duo), anchored near the
                // bottom like the system side tab bar.
                tailwind.style(
                  'flex flex-col absolute items-center py-1 gap-1 rounded-full',
                  capsuleBorder,
                  `w-[${SIDE_TAB_BAR_WIDTH}px] bottom-[${bottom + 16}px]`,
                ),
                sideTabBar.edge === 'right'
                  ? { right: sideTabBar.offset }
                  : { left: sideTabBar.offset },
              ]
            : [
                tailwind.style(
                  'flex flex-row absolute w-full bottom-0 pl-[72px] pr-[71px] pt-[11px] pb-8 bg-[#00000009]',
                  `h-[${tabBarHeight}px]`,
                ),
              ],
          android: [
            tailwind.style(
              'flex flex-row absolute w-full bottom-0 pl-[72px] pr-[71px] pt-[11px] bg-white',
              `h-[${tabBarHeight}px] pb-[${bottom + 11}px]`,
            ),
          ],
        })}>
        {!sideTabBar && (
          <Animated.View style={tailwind.style('absolute inset-0 h-[1px] bg-blackA-A3')} />
        )}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          return (
            <TabItem
              key={route.key}
              options={options}
              onPress={createPressHandler(route, isFocused)}
              onLongPress={createLongPressHandler(route)}
              route={route}
              isFocused={isFocused}
              vertical={!!sideTabBar}
            />
          );
        })}
      </TabBarBackground>
    </>
  );
};
