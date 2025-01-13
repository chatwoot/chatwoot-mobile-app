import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { FilterButton as FilterButtonComponent } from '../FilterButton';
import { ConversationFilterOptions } from './FilterBarMockData';

const meta = {
  title: 'Filters',
  component: FilterButtonComponent,
  decorators: [
    Story => (
      <View style={{ flex: 1, padding: 16, maxWidth: 100 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof FilterButtonComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FilterButton: Story = {
  args: {
    allFilters: ConversationFilterOptions[0],
    selectedFilters: {
      assignee_type: 'me',
      status: 'open',
      sort_by: 'latest',
    },
    handleOnPress: () => {},
  },
};
