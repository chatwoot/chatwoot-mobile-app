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
          padding: 16,
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

// Single letter initial
export const SingleInitial: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <Avatar size="xs" name="John" />
      <Avatar size="sm" name="John" />
      <Avatar size="md" name="John" />
    </View>
  ),
};

// Avatar with image
export const WithImage: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <Avatar size="xs" name="John Doe" src={{ uri: 'https://i.pravatar.cc/300' }} />
      <Avatar size="sm" name="John Doe" src={{ uri: 'https://i.pravatar.cc/300' }} />
      <Avatar size="md" name="John Doe" src={{ uri: 'https://i.pravatar.cc/300' }} />
      <Avatar size="lg" name="John Doe" src={{ uri: 'https://i.pravatar.cc/300' }} />
      <Avatar size="xl" name="John Doe" src={{ uri: 'https://i.pravatar.cc/300' }} />
      <Avatar size="2xl" name="John Doe" src={{ uri: 'https://i.pravatar.cc/300' }} />
      <Avatar size="3xl" name="John Doe" src={{ uri: 'https://i.pravatar.cc/300' }} />
      <Avatar size="4xl" name="John Doe" src={{ uri: 'https://i.pravatar.cc/300' }} />
    </View>
  ),
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
  render: () => (
    <View style={{ gap: 16 }}>
      <Avatar size="xs" name="John Doe" status="online" />
      <Avatar size="sm" name="John Doe" status="online" />
      <Avatar size="md" name="John Doe" status="online" />
      <Avatar size="lg" name="John Doe" status="online" />
      <Avatar size="xl" name="John Doe" status="online" />
      <Avatar size="2xl" name="John Doe" status="online" />
      <Avatar size="3xl" name="John Doe" status="online" />
      <Avatar size="4xl" name="John Doe" status="online" />
    </View>
  ),
};

// Avatar with typing status
export const TypingStatus: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Avatar size="xs" name="John Doe" status="typing" />
      <Avatar size="sm" name="John Doe" status="typing" />
      <Avatar size="md" name="John Doe" status="typing" />
      <Avatar size="lg" name="John Doe" status="typing" />
      <Avatar size="xl" name="John Doe" status="typing" />
      <Avatar size="2xl" name="John Doe" status="typing" />
      <Avatar size="3xl" name="John Doe" status="typing" />
      <Avatar size="4xl" name="John Doe" status="typing" />
    </View>
  ),
};

// Fallback to initials when image fails
export const ImageFallback: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <Avatar size="xs" name="John Doe" src={{ uri: 'https://invalid-image-url.com/image.jpg' }} />
      <Avatar size="sm" name="John Doe" src={{ uri: 'https://invalid-image-url.com/image.jpg' }} />
      <Avatar size="md" name="John Doe" src={{ uri: 'https://invalid-image-url.com/image.jpg' }} />
      <Avatar size="lg" name="John Doe" src={{ uri: 'https://invalid-image-url.com/image.jpg' }} />
      <Avatar size="xl" name="John Doe" src={{ uri: 'https://invalid-image-url.com/image.jpg' }} />
      <Avatar size="2xl" name="John Doe" src={{ uri: 'https://invalid-image-url.com/image.jpg' }} />
      <Avatar size="3xl" name="John Doe" src={{ uri: 'https://invalid-image-url.com/image.jpg' }} />
      <Avatar size="4xl" name="John Doe" src={{ uri: 'https://invalid-image-url.com/image.jpg' }} />
    </View>
  ),
};

// Avatar with counter badge
export const WithCounter: Story = {
  render: () => (
    <View style={{ gap: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
      <Avatar size="xs" name="ML" counter={{ count: 4 }} />
      <Avatar size="sm" name="ML" counter={{ count: 4 }} />
      <Avatar size="md" name="ML" counter={{ count: 4 }} />
      <Avatar size="lg" name="ML" counter={{ count: 4 }} />
      <Avatar size="xl" name="ML" counter={{ count: 4 }} />
      <Avatar size="2xl" name="ML" counter={{ count: 4 }} />
      <Avatar size="3xl" name="ML" counter={{ count: 4 }} />
      <Avatar size="4xl" name="ML" counter={{ count: 4 }} />
    </View>
  ),
};

// Avatar with different counter values
export const CounterVariations: Story = {
  render: () => (
    <View style={{ gap: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
      <Avatar size="4xl" name="ML" counter={{ count: 1 }} />
      <Avatar size="4xl" name="ML" counter={{ count: 4 }} />
      <Avatar size="4xl" name="ML" counter={{ count: 9 }} />
      <Avatar size="4xl" name="ML" counter={{ count: 12 }} />
      <Avatar size="4xl" name="ML" counter={{ count: 99 }} />
      <Avatar size="4xl" name="ML" counter={{ count: 150 }} />
    </View>
  ),
};
