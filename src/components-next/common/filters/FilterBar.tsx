import React from 'react';
import Animated, { LinearTransition, withTiming } from 'react-native-reanimated';
import { tailwind } from '@/theme';
import { FilterButton } from './FilterButton';
import { FilterOption } from '@/types';

type FilterBarProps = {
  filterOptions: (
    | FilterOption<'assignee_type'>
    | FilterOption<'status'>
    | FilterOption<'sort_by'>
    | FilterOption<'inbox_id'>
  )[];
  currentFilters: Record<string, string>;
  onFilterPress: (type: 'assignee_type' | 'status' | 'sort_by' | 'inbox_id') => void;
};
export const FilterBar = ({ filterOptions, currentFilters, onFilterPress }: FilterBarProps) => {
  // Row Exit Animation
  const exiting = () => {
    'worklet';
    const animations = {
      opacity: withTiming(0, { duration: 250 }),
    };
    const initialValues = {
      opacity: 1,
    };
    return {
      initialValues,
      animations,
    };
  };

  return (
    <Animated.View
      exiting={exiting}
      style={tailwind.style('px-3 pt-2 pb-1.5 h-[46px] flex flex-row')}>
      {filterOptions.map((value, index) => (
        <Animated.View
          layout={LinearTransition.springify().stiffness(200).damping(24)}
          key={index}
          style={tailwind.style('pr-2')}>
          <FilterButton
            handleOnPress={() => onFilterPress(value.type)}
            allFilters={value}
            currentFilters={currentFilters}
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
};
