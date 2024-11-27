import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/theme';
import { Label } from '@/types/common/Label';
import { TickIcon } from '@/svg-icons';
import { Icon } from '@/components-next';

type LabelCellProps = {
  value: Label;
  index: number;
  handleLabelPress: (labelText: string) => void;
  isLastItem: boolean;
  isActive?: boolean;
};

export const LabelCell = (props: LabelCellProps) => {
  const { value, isLastItem, handleLabelPress, isActive = false } = props;

  const handleOnPress = useCallback(() => {
    handleLabelPress(value.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable onPress={handleOnPress} style={tailwind.style('flex flex-row items-center pl-1.5')}>
      <Animated.View style={tailwind.style('h-4 w-4 rounded-full', `bg-[${value.color}]`)} />
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !isLastItem ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={[
            tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            ),
          ]}>
          {value.title}
        </Animated.Text>
        {isActive ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};
