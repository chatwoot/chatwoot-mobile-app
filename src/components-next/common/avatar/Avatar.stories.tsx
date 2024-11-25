import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'Avatar',
  component: Avatar,
  args: {
    name: 'John Doe',
    size: 'xl',
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          padding: 20,
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

// Basic avatar with name only
export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
};

// Avatar with image
export const WithImage: Story = {
  args: {
    name: 'John Doe',
    src: { uri: 'https://i.pravatar.cc/300' },
  },
};

// Squared Avatar
export const SquaredAvatar: Story = {
  args: {
    name: 'John Doe',
    squared: true,
    src: { uri: 'https://i.pravatar.cc/300' },
  },
};

// Avatar with online status
export const WithOnlineStatus: Story = {
  args: {
    name: 'John Doe',
    src: { uri: 'https://i.pravatar.cc/300' },
    status: 'online',
  },
};

// Avatar sizes demonstration
export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <Avatar size="xs" name="John Doe" />
      <Avatar size="sm" name="John Doe" />
      <Avatar size="md" name="John Doe" />
      <Avatar size="lg" name="John Doe" />
      <Avatar size="xl" name="John Doe" />
      <Avatar size="2xl" name="John Doe" />
      <Avatar size="3xl" name="John Doe" />
      <Avatar size="4xl" name="John Doe" />
    </View>
  ),
};

// Avatar with custom background color
export const CustomBackground: Story = {
  args: {
    name: 'John Doe',
    status: 'online',
    parentsBackground: 'bg-gray-100',
  },
};

// Avatar with typing status
export const TypingStatus: Story = {
  args: {
    name: 'John Doe',
    src: { uri: 'https://i.pravatar.cc/300' },
    status: 'typing',
  },
};

// Single letter initial
export const SingleInitial: Story = {
  args: {
    name: 'John',
    size: 'md',
  },
};

// Fallback to initials when image fails
export const ImageFallback: Story = {
  args: {
    name: 'John Doe',
    src: { uri: 'https://invalid-image-url.com/image.jpg' },
  },
};
