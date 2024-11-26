import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';

import { ConversationIconFilled, ConversationIconOutline } from '@/svg-icons';

const meta = {
  title: 'Icon',
  component: Icon,
  args: {
    icon: <ConversationIconFilled />,
    size: 'xl',
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          padding: 16,
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

// Basic icon with default size
export const BasicIcon: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <Icon icon={<ConversationIconOutline />} />
    </View>
  ),
};

export const IconSizes: Story = {
  render: () => (
    <View style={{ gap: 32, alignItems: 'center' }}>
      <Icon icon={<ConversationIconOutline />} size={10} />
      <Icon icon={<ConversationIconOutline />} size={12} />
      <Icon icon={<ConversationIconOutline />} size={16} />
      <Icon icon={<ConversationIconOutline />} size={20} />
      <Icon icon={<ConversationIconOutline />} size={24} />
      <Icon icon={<ConversationIconOutline />} size={32} />
    </View>
  ),
};

// Filled vs Outline comparison
export const IconVariants: Story = {
  render: () => (
    <View style={{ gap: 16, flexDirection: 'row' }}>
      <Icon icon={<ConversationIconFilled />} size={24} />
      <Icon icon={<ConversationIconOutline />} size={24} />
    </View>
  ),
};
