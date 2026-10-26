import React, { PropsWithChildren } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
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
import {
  IOS_DESIGN,
  useHaptic,
  useIsSplitLayout,
  useScaleAnimation,
  useSideTabBarLayout,
  useTabBarHeight,
} from '@/utils';
import {
  SIDE_STATUS_BAR_CLEARANCE,
  SIDE_STATUS_BAR_CLEARANCE_COMPACT,
  SIDE_TAB_BAR_WIDTH,
} from '@/constants';
import { useSideToolbarItems } from '@/context';

import { TabParamList } from './AppTabs';
import { useAppSelector } from '@/hooks';

const tabExitSpringConfig = { damping: 20, stiffness: 360, mass: 1 };
const tabEnterSpringConfig = { damping: 30, stiffness: 360, mass: 1 };

type TabBarIconsProps = {
  focused: boolean;
  route: RouteProp<TabParamList, keyof TabParamList>;
  // Centered 24pt glyph for the round buttons of the side tab bar.
  compact?: boolean | number;
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

type TabBarBackgroundProps = BlurViewProps &
  PropsWithChildren & { capsule?: boolean; capsuleRadius?: number };

// Floating tab bar on iPhone (iOS 26 style): a Liquid Glass capsule centered above the home
// indicator, with a soft pill behind the selected tab.
const FLOATING_BAR_HEIGHT = 60;
const FLOATING_TAB_WIDTH = 76;

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
const CapsuleFill = ({
  blurAmount,
  blurType,
  radius = SIDE_TAB_BAR_WIDTH / 2,
}: BlurViewProps & { radius?: number }) =>
  useLiquidGlass ? (
    <GlassView
      glassEffectStyle="regular"
      isInteractive
      style={[tailwind.style('absolute inset-0'), { borderRadius: radius }]}
    />
  ) : (
    <Animated.View style={tailwind.style('absolute inset-0 rounded-full overflow-hidden')}>
      <BlurView {...{ blurAmount, blurType }} style={tailwind.style('flex-1 bg-white')} />
    </Animated.View>
  );

const TabBarBackground = (props: TabBarBackgroundProps) => {
  const { children, style, blurAmount, blurType, capsule, capsuleRadius } = props;

  const currentState = useAppSelector(selectCurrentState);

  const tabBarHeight = useTabBarHeight();
  const sideTabBar = useSideTabBarLayout();
  // How far the side capsule moves to leave the screen, signed toward its edge.
  const sideExitDistance = sideTabBar
    ? (sideTabBar.offset + sideTabBar.width) * (sideTabBar.edge === 'right' ? 1 : -1)
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
        <CapsuleFill {...{ blurAmount, blurType }} radius={capsuleRadius} />
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

  const { onPress, onLongPress, isFocused, options, route, vertical, floating } = props;
  // Side capsule button size and icon size (larger when the Duo is closed).
  const sideTabBar = useSideTabBarLayout();
  const buttonSize = sideTabBar?.buttonSize ?? 34;
  const sideIconSize = Math.round(24 * (sideTabBar?.iconScale ?? 1));

  // Memoize hitSlop to prevent new object reference on every render. In the side capsule the
  // 34pt buttons get an even margin so the tap area stays comfortable.
  const hitSlop = React.useMemo(
    () =>
      vertical
        ? { top: 4, left: 6, right: 6, bottom: 4 }
        : { top: 2, left: 10, right: 10, bottom: 10 },
    [vertical],
  );

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
            ? `h-[${buttonSize}px] w-[${buttonSize}px] rounded-full ${isFocused ? 'bg-blackA-A3' : 'bg-transparent'}`
            : floating
              ? `h-[48px] w-[${FLOATING_TAB_WIDTH}px] rounded-full ${isFocused ? 'bg-blackA-A3' : 'bg-transparent'}`
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
        style={
          vertical
            ? tailwind.style(`h-[${buttonSize}px] w-[${buttonSize}px] items-center justify-center`)
            : floating
              ? tailwind.style(`h-[48px] w-[${FLOATING_TAB_WIDTH}px] items-center justify-center`)
              : undefined
        }
        onPress={onPress}
        onLongPress={onLongPress}>
        {/* Round buttons (side capsule, floating bar) use the glyph-centered icons. */}
        <TabBarIcons
          focused={isFocused}
          route={route}
          compact={vertical ? sideIconSize : floating ? 26 : undefined}
        />
      </Pressable>
    </Animated.View>
  );
};

/**
 * The side toolbar (iPhone Duo): header actions of the focused screen at the top of the side
 * column, below the status bar. Rendered by the tab bar, and by full-screen pages outside
 * the tabs (e.g. a chat opened from a notification) inside their own SideToolbarProvider.
 */
export const SideToolbarSlot = () => {
  const sideTabBar = useSideTabBarLayout();
  const sideToolbarItems = useSideToolbarItems();
  const isSplit = useIsSplitLayout();
  if (!sideTabBar || !sideToolbarItems) return null;
  const top = isSplit ? SIDE_STATUS_BAR_CLEARANCE : SIDE_STATUS_BAR_CLEARANCE_COMPACT;
  return (
    // Separate round glass buttons (not a capsule), so actions don't look like tabs.
    <Animated.View
      style={[
        tailwind.style('absolute flex flex-col items-center gap-2.5', `top-[${top}px]`),
        sideTabBar.edge === 'right' ? { right: sideTabBar.offset } : { left: sideTabBar.offset },
      ]}>
      {sideToolbarItems}
    </Animated.View>
  );
};

/**
 * Hairline between the content and the side status column when the Duo is closed (side
 * tabs, no split view), so the column reads as its own strip. Drawn once over the app.
 */
export const SideColumnDivider = () => {
  const sideTabBar = useSideTabBarLayout();
  const isSplit = useIsSplitLayout();
  const { left, right } = useSafeAreaInsets();
  if (!sideTabBar || isSplit) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        tailwind.style('absolute top-0 bottom-0 bg-blackA-A3'),
        { width: StyleSheet.hairlineWidth },
        sideTabBar.edge === 'right' ? { right } : { left },
      ]}
    />
  );
};

export const BottomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const hapticSelection = useHaptic();
  const tabBarHeight = useTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  const sideTabBar = useSideTabBarLayout();
  // iPhone without side tabs: a floating glass capsule instead of the full-width bar.
  const floating = IOS_DESIGN && !sideTabBar;

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
      <SideToolbarSlot />
      <TabBarBackground
        blurAmount={25}
        blurType="light"
        capsule={!!sideTabBar || floating}
        capsuleRadius={
          floating ? FLOATING_BAR_HEIGHT / 2 : sideTabBar ? sideTabBar.width / 2 : undefined
        }
        style={Platform.select({
          ios: floating
            ? [
                tailwind.style(
                  'flex flex-row absolute self-center items-center px-1.5 rounded-full',
                  capsuleBorder,
                  `h-[${FLOATING_BAR_HEIGHT}px]`,
                ),
                // Just above the home indicator, like the system tab bar.
                { bottom: Math.max(bottom - 14, 12) },
              ]
            : sideTabBar
              ? [
                  // Floating capsule on the status bar side (iPhone Duo), anchored near the
                  // bottom like the system side tab bar.
                  tailwind.style(
                    'flex flex-col absolute items-center py-[3px] gap-1.5 rounded-full',
                    capsuleBorder,
                    `w-[${sideTabBar.width}px] bottom-[${bottom + 16}px]`,
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
        {!sideTabBar && !floating && (
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
              floating={floating}
            />
          );
        })}
      </TabBarBackground>
    </>
  );
};
