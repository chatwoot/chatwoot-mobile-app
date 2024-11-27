import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';

import { CaretBottomSmall } from '@/svg-icons';
import { tailwind } from '@/theme';
import { FilterOption } from '@/types';
import { useHaptic, useScaleAnimation } from '@/utils';
import { Icon } from '../icon';

type FilterButtonProps = {
  handleOnPress: (type: string) => void;
  selectedFilters: Record<string, string>;
  allFilters:
    | FilterOption<'assignee_type'>
    | FilterOption<'status'>
    | FilterOption<'sort_by'>
    | FilterOption<'inbox_id'>;
};

export const FilterButton = (props: FilterButtonProps) => {
  const { allFilters, handleOnPress, selectedFilters } = props;
  const { handlers, animatedStyle } = useScaleAnimation();
  const { filtersModalSheetRef } = useRefsContext();

  const hapticSelection = useHaptic();

  const onPress = useCallback(() => {
    hapticSelection?.();
    filtersModalSheetRef.current?.present();
    handleOnPress(allFilters.type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={tailwind.style('px-3 py-[7px] rounded-lg bg-gray-100 flex flex-row items-center')}
        onPress={onPress}
        {...handlers}>
        <Animated.Text
          style={tailwind.style(
            'text-sm font-inter-medium-24 leading-[16px] tracking-[0.24px] pr-1 capitalize text-gray-950',
          )}>
          {allFilters.options[selectedFilters[allFilters.type] as keyof typeof allFilters.options]}
        </Animated.Text>
        <Icon icon={<CaretBottomSmall />} size={7.5} />
      </Pressable>
    </Animated.View>
  );
};
