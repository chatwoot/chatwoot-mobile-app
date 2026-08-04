import React, { PropsWithChildren } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
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
import { selectChatListBadgeCounters } from '@/store/chat-list/chatListSelectors';

import {
  ArchiveIconFilled,
  ArchiveIconOutline,
  ConversationIconFilled,
  ConversationIconOutline,
  FunnelIconFilled,
  FunnelIconOutline,
  InboxIconFilled,
  InboxIconOutline,
  SettingsIconFilled,
  SettingsIconOutline,
} from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useHaptic, useScaleAnimation, useTabBarHeight } from '@/utils';

import { TabParamList } from './AppTabs';
import { useAppSelector } from '@/hooks';
import {
  formatBadgeCount,
  getTabBadgeCount,
  getTabLabelKey,
  shouldShowBadge,
  visibleTabBarRoutes,
} from './tabBarUtils';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const tabExitSpringConfig = { damping: 20, stiffness: 360, mass: 1 };
const tabEnterSpringConfig = { damping: 30, stiffness: 360, mass: 1 };

type TabBarIconsProps = {
  focused: boolean;
  route: RouteProp<TabParamList, keyof TabParamList>;
};

const TabBarIcons = ({ focused, route }: TabBarIconsProps) => {
  switch (route.name) {
    // "Новые" переиспользует прежнюю иконку таба "Conversations" (диалоговый пузырь) —
    // задача заводит только FunnelIcon/ArchiveIcon (C4), см. комментарий в плане волны.
    case 'ChatListNew':
      return focused ? <ConversationIconFilled /> : <ConversationIconOutline />;
    // "Мои" переиспользует прежнюю иконку таба "Inbox" (тот таб больше не в баре).
    case 'ChatListMine':
      return focused ? <InboxIconFilled /> : <InboxIconOutline />;
    case 'ChatListArchive':
      return focused ? <ArchiveIconFilled /> : <ArchiveIconOutline />;
    case 'Funnel':
      return focused ? <FunnelIconFilled /> : <FunnelIconOutline />;
    case 'Settings':
      return focused ? <SettingsIconFilled /> : <SettingsIconOutline />;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabItem = (props: any) => {
  const { handlers, animatedStyle } = useScaleAnimation();

  const { onPress, onLongPress, isFocused, options, route, labelKey, badgeCount } = props;

  // Memoize hitSlop to prevent new object reference on every render
  const hitSlop = React.useMemo(() => ({ top: 2, left: 10, right: 10, bottom: 10 }), []);

  // Use stable object reference for accessibilityState when not focused
  const accessibilityState = React.useMemo(
    () => (isFocused ? { selected: true } : {}),
    [isFocused],
  );

  const showBadge = shouldShowBadge(badgeCount);

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
        style={tailwind.style('items-center')}>
        <View>
          <TabBarIcons focused={isFocused} route={route} />
          {showBadge ? (
            <View
              style={tailwind.style(
                'absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-tomato-700 items-center justify-center',
              )}>
              <Text
                style={tailwind.style(
                  'text-[10px] leading-[12px] font-inter-semibold-20 text-white',
                )}>
                {formatBadgeCount(badgeCount)}
              </Text>
            </View>
          ) : null}
        </View>
        {labelKey ? (
          <Text
            numberOfLines={1}
            style={tailwind.style(
              'text-[10px] leading-[12px] mt-1',
              isFocused
                ? 'font-inter-medium-24 text-gray-950'
                : 'font-inter-normal-20 text-gray-600',
            )}>
            {i18n.t(labelKey)}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

export const BottomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const hapticSelection = useHaptic();
  const tabBarHeight = useTabBarHeight();
  const badgeCounters = useAppSelector(selectChatListBadgeCounters);

  // Пять роутов бара в фиксированном порядке (C4, п.1/3 плана волны) — таб `Inbox`
  // остаётся зарегистрированным роутом Tab.Navigator (уведомления открываются
  // колокольчиком в шапке списка), но здесь не рисуется.
  const barRoutes = visibleTabBarRoutes(state.routes);
  const focusedRouteKey = state.routes[state.index]?.key;

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
    <TabBarBackground
      blurAmount={25}
      blurType="light"
      style={Platform.select({
        ios: [
          tailwind.style(
            'flex flex-row absolute w-full bottom-0 px-2 pt-[11px] pb-8 bg-[#00000009]',
            `h-[${tabBarHeight}px]`,
          ),
        ],
        android: [
          tailwind.style(
            'flex flex-row absolute w-full bottom-0 px-2 py-[11px] bg-white',
            `h-[${tabBarHeight}px]`,
          ),
        ],
      })}>
      <Animated.View style={tailwind.style('absolute inset-0 h-[1px] bg-blackA-A3')} />
      {barRoutes.map(route => {
        const { options } = descriptors[route.key];
        const isFocused = route.key === focusedRouteKey;

        return (
          <TabItem
            key={route.key}
            options={options}
            onPress={createPressHandler(route, isFocused)}
            onLongPress={createLongPressHandler(route)}
            route={route}
            isFocused={isFocused}
            labelKey={getTabLabelKey(route.name)}
            badgeCount={getTabBadgeCount(route.name, badgeCounters)}
          />
        );
      })}
    </TabBarBackground>
  );
};
