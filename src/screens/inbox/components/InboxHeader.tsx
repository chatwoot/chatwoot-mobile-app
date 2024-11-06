import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Icon } from '@/components-next/common/icon';
import { DoubleCheckIcon, FilterIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

export const InboxHeader = () => {
  //   const { toggleShowUnRead, showUnread } = useInboxReadUnreadState();
  const handleToggleState = () => {
    // toggleShowUnRead();
  };
  const showUnread = false;
  return (
    <Animated.View style={[tailwind.style('border-b-[1px] border-b-blackA-A3')]}>
      <Animated.View
        style={[tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]')]}>
        <Animated.View style={tailwind.style('flex-1')}>
          <Pressable hitSlop={16}>
            <Icon icon={<DoubleCheckIcon />} size={24} />
          </Pressable>
        </Animated.View>
        <Animated.View style={tailwind.style('flex-1')}>
          <Animated.Text
            style={tailwind.style(
              'text-[17px] text-center leading-[17px] tracking-[0.32px] font-inter-medium-24 text-gray-950',
            )}>
            Inbox
          </Animated.Text>
        </Animated.View>
        <Animated.View style={tailwind.style('flex-1 items-end')}>
          <Pressable onPress={handleToggleState} hitSlop={16}>
            {showUnread ? (
              <Animated.View
                entering={FadeIn.springify().stiffness(180).damping(18)}
                exiting={FadeOut.springify().stiffness(180).damping(18)}
                style={tailwind.style(
                  'absolute -right-1 -bottom-[3px] h-8 w-8 bg-blue-800 rounded-full',
                )}
              />
            ) : null}
            <Icon icon={<FilterIcon stroke={showUnread ? '#FFF' : undefined} />} size={24} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
