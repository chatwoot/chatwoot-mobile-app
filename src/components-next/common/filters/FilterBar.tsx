import React from 'react';
import Animated, { LinearTransition, withTiming } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { AllStatusTypes, AssigneeTypes, FilterOption, SortTypes } from '@/types';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { useAppSelector } from '@/hooks';

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
  | FilterOption<'inbox_id'>
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

const getInboxOptions = (inboxes: { id: number; name: string }[]) => {
  const options: Record<string, string> = {
    '0': 'All Inboxes',
  };

  inboxes.forEach(inbox => {
    options[inbox.id] = inbox.name;
  });

  return options;
};

export const FilterBar = () => {
  const inboxes = useAppSelector(selectAllInboxes);

  const dynamicFilterOptions = [
    ...filterOptions,
    {
      type: 'inbox_id' as const,
      options: getInboxOptions(inboxes),
      defaultFilter: 'All Inboxes',
    },
  ];

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
      {dynamicFilterOptions.map((value, index) => (
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
