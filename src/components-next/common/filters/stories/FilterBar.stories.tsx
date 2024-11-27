import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { BaseFilterOption, FilterBar as FilterBarComponent } from '../FilterBar';
import { AssigneeOptions, SortOptions, StatusOptions } from '@/types';

export const ConversationFilterOptions: BaseFilterOption[] = [
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

const meta = {
  title: 'Filters',
  component: FilterBarComponent,
  decorators: [
    Story => (
      <View style={{ flex: 1, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof FilterBarComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FilterBar: Story = {
  args: {
    allFilters: ConversationFilterOptions,
    selectedFilters: {
      assignee_type: 'me',
      status: 'open',
      sort_by: 'latest',
    },
    onFilterPress: () => {},
  },
};
