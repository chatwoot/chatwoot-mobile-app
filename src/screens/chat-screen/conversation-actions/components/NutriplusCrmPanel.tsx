import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from '@/components-next';
import { CaretRight, GridIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

type NutriplusCrmPanelProps = {
  onPress: () => void;
};

const NutriplusCrmPanel = ({ onPress }: NutriplusCrmPanelProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [tailwind.style(pressed ? 'bg-gray-100' : '', 'rounded-b-[13px]')]}>
      <Animated.View style={tailwind.style('flex-row items-center justify-between pl-3')}>
        <Icon icon={<GridIcon />} />
        <Animated.View
          style={tailwind.style(
            'flex-1 flex-row items-center justify-between py-[11px] ml-[10px]',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-420-20 leading-[22.4px] tracking-[0.16px] text-gray-950',
            )}>
            NutriPlus CRM
          </Animated.Text>
          <Animated.View style={tailwind.style('pr-3')}>
            <Icon icon={<CaretRight />} size={20} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default NutriplusCrmPanel;
