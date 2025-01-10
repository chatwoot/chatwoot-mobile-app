import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from './SearchBar';
import { CloseIcon } from '@/svg-icons';

const meta = {
  title: 'Search Bar',
  component: SearchBar,
} satisfies Meta<typeof SearchBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Search with loading
export const WithLoading: Story = {
  args: {
    isLoading: true,
  },
};

// Search with prefix icon
export const WithPrefixIcon: Story = {
  args: {
    prefix: <CloseIcon />,
  },
};
