import React from 'react';
import Animated, { LinearTransition, withTiming } from 'react-native-reanimated';
import { tailwind } from '@/theme';
import { FilterButton } from './FilterButton';
import i18n from '@/i18n';

// Generic type for filter options
export type BaseFilterOption = {
  type: string;
  options: Record<string, string>;
  defaultFilter: string;
};

type FilterBarProps = {
  allFilters: BaseFilterOption[];
  selectedFilters: Record<string, string>;
  onFilterPress: (type: string) => void;
};

export const FilterBar = ({ allFilters, selectedFilters, onFilterPress }: FilterBarProps) => {
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

  const getFilterTitle = (value: BaseFilterOption) => {
    return i18n.t(
      `CONVERSATION.FILTERS.${value.type.toUpperCase()}.OPTIONS.${selectedFilters[value.type].toUpperCase()}`,
    );
  };

  return (
    <Animated.View
      exiting={exiting}
      style={tailwind.style('px-3 pt-2 pb-1.5 h-[46px] flex flex-row')}>
      {allFilters.map((value, index) => {
        if (value.type === 'inbox_id') {
          return (
            <Animated.View
              layout={LinearTransition.springify().stiffness(200).damping(24)}
              key={index}
              style={tailwind.style('pr-2')}>
              <FilterButton
                handleOnPress={() => onFilterPress(value.type)}
                value={value.options[selectedFilters[value.type] as keyof typeof value.options]}
              />
            </Animated.View>
          );
        }
        return (
          <Animated.View
            layout={LinearTransition.springify().stiffness(200).damping(24)}
            key={index}
            style={tailwind.style('pr-2')}>
            <FilterButton
              handleOnPress={() => onFilterPress(value.type)}
              value={getFilterTitle(value)}
            />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
};
