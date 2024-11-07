import React from 'react';
import Animated, { LinearTransition, withTiming } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { AllStatusTypes, AssigneeTypes, FilterOption, SortTypes } from '@/types';

import { FilterButton } from './FilterButton';

export const AssigneeOptions: Record<AssigneeTypes, string> = {
  me: 'Mine',
  unassigned: 'Unassigned',
  all: 'All',
};

export const StatusOptions: Record<AllStatusTypes, string> = {
  all: 'All Statuses',
  open: 'Open',
  resolved: 'Resolved',
  pending: 'Pending',
  snoozed: 'Snoozed',
};

export const SortOptions: Record<SortTypes, string> = {
  latest: 'Latest',
  sort_on_created_at: 'Created At',
  sort_on_priority: 'Priority',
};

export const filterOptions: (
  | FilterOption<'assignee_type'>
  | FilterOption<'status'>
  | FilterOption<'sort_by'>
)[] = [
  {
    type: 'assignee_type',
    options: AssigneeOptions,
    defaultFilter: 'All',
  },
  {
    type: 'status',
    options: StatusOptions,
    defaultFilter: 'Open',
  },
  {
    type: 'sort_by',
    options: SortOptions,
    defaultFilter: 'Latest',
  },
];

export const FilterBar = () => {
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
          <FilterButton handleOnPress={() => null} filterData={value} />
        </Animated.View>
      ))}
    </Animated.View>
  );
};
