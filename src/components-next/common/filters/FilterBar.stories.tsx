import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { FilterBar as FilterBarComponent } from './FilterBar';
import { filterOptions } from './ConversationFilterBar';

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
    allFilters: filterOptions,
    selectedFilters: {
      assignee_type: 'me',
      status: 'open',
      sort_by: 'latest',
    },
    onFilterPress: () => {},
  },
};
