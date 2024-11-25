import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Button',
  component: Button,
  args: {
    text: 'Button Text',
    handlePress: () => console.log('Button pressed'),
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 16,
          gap: 16,
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

// Primary Button Stories
export const PrimaryButton: Story = {
  args: {
    text: 'Sign in',
    variant: 'primary',
  },
};

// Secondary Button Stories
export const SecondaryButton: Story = {
  args: {
    text: 'Cancel',
    variant: 'secondary',
  },
};

export const SecondaryDestructiveButton: Story = {
  args: {
    text: 'Remove',
    variant: 'secondary',
    isDestructive: true,
  },
};

// Long Text Examples
export const PrimaryLongText: Story = {
  args: {
    text: 'This is a very long button text to test wrapping',
    variant: 'primary',
  },
};

// Button Group Example
export const ButtonGroup: Story = {
  decorators: [
    Story => (
      <View style={{ flex: 1, padding: 16, gap: 16 }}>
        <Button text="Primary Button" variant="primary" />
        <Button text="Secondary Button" variant="secondary" />
        <Button text="Destructive Secondary" variant="secondary" isDestructive />
      </View>
    ),
  ],
};
