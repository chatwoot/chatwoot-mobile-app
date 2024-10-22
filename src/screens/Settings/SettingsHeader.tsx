import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';

type SettingsHeaderComponentProps = {
  handleSetStatusPress: () => void;
};

export const SettingsHeaderComponent = (props: SettingsHeaderComponentProps) => {
  const { handleSetStatusPress } = props;
  return (
    <Animated.View style={[tailwind.style('border-b-[1px] border-b-blackA-A3')]}>
      <Animated.View style={tailwind.style('flex flex-row px-4 pt-2 pb-[12px]')}>
        <Animated.View style={tailwind.style('flex-1')} />
        <Animated.View style={tailwind.style('flex-1 justify-center items-center')}>
          <Animated.Text
            style={tailwind.style(
              'text-[17px] font-inter-medium-24 leading-[17px] tracking-[0.32px] text-center text-gray-950',
            )}>
            Settings
          </Animated.Text>
        </Animated.View>
        <Pressable onPress={handleSetStatusPress} style={tailwind.style('flex-1 items-end')}>
          <Animated.View>
            <Animated.Text
              style={tailwind.style(
                'text-md  font-inter-medium-24  leading-[17px] tracking-[0.24px] text-blue-800',
              )}>
              Set Status
            </Animated.Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};
