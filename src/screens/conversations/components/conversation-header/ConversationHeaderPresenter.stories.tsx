import { Meta, StoryObj } from '@storybook/react';
import { ConversationHeaderPresenter } from './ConversationHeaderPresenter';
import { tailwind } from '@/theme';
import { View } from 'react-native';

const meta: Meta<typeof ConversationHeaderPresenter> = {
  title: 'ConversationHeader',
  component: ConversationHeaderPresenter,
  args: {
    currentState: 'none',
    isSelectedAll: false,
    filtersAppliedCount: 0,
    onLeftIconPress: () => {},
    onRightIconPress: () => {},
    onClearFilter: () => {},
  },
  argTypes: {
    currentState: {
      control: 'select',
      options: ['Default', 'Selection', 'Filter', 'Search'],
    },
    isSelectedAll: {
      control: 'boolean',
    },
    filtersAppliedCount: {
      control: 'number',
    },
  },
  decorators: [
    Story => (
      <View style={tailwind.style('border-b-[1px] border-blackA-A3')}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConversationHeaderPresenter>;

export const Default: Story = {
  args: {
    currentState: 'none',
  },
};

export const SelectAllConversations: Story = {
  args: {
    currentState: 'Select',
    isSelectedAll: false,
  },
};

export const SelectedAllConversations: Story = {
  args: {
    currentState: 'Select',
    isSelectedAll: true,
  },
};

export const Filter: Story = {
  args: {
    currentState: 'Filter',
    filtersAppliedCount: 2,
  },
};

export const FilterEmpty: Story = {
  args: {
    currentState: 'Filter',
    filtersAppliedCount: 0,
  },
};

export const FilterApplied: Story = {
  args: {
    currentState: 'none',
    filtersAppliedCount: 2,
  },
};
