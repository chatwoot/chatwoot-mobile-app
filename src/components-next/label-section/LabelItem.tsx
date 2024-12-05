import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Label } from '@/types';

type LabelItemProps = {
  item: Label;
  index: number;
};

export const LabelItem = (props: LabelItemProps) => {
  const { item } = props;
  return (
    <Animated.View
      style={[
        styles.labelShadow,
        tailwind.style('flex flex-row items-center bg-white px-3 py-[7px] rounded-lg mr-2 mt-3'),
      ]}>
      <Animated.View style={tailwind.style('h-2 w-2 rounded-full', `bg-[${item.color}]`)} />
      <Animated.Text
        style={tailwind.style(
          'text-md font-inter-normal-20 leading-[17px] tracking-[0.32px] pl-1.5 text-gray-950',
        )}>
        {item.title}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  labelShadow: {
    // box-shadow: 0px 0.15000000596046448px 2px 0px #00000040;
    // box-shadow: [horizontal offset] [vertical offset] [blur radius] [optional spread radius] [color];
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 0.15 },
    shadowRadius: 2,
    shadowOpacity: 0.35,
    elevation: 2,
  },
});
