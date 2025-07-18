import React from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import { Swipeable } from './Swipeable';
import { tailwind } from '@/theme';

const SwipeableWrapper = ({
  children,
  openedRowIndex = null,
}: {
  children: (openedRowIndex: SharedValue<number | null>) => React.ReactNode;
  openedRowIndex?: number | null;
}) => {
  const openedRowIndexValue = useSharedValue(openedRowIndex);
  return (
    <GestureHandlerRootView style={tailwind.style('flex-1 ')}>
      {children(openedRowIndexValue)}
    </GestureHandlerRootView>
  );
};

const meta = {
  title: 'Swipeable',
  component: Swipeable,
  decorators: [
    Story => (
      <View style={tailwind.style('flex-1 p-4')}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    notes:
      'A swipeable component that supports left and right actions with over swipe capabilities',
  },
} satisfies Meta<typeof Swipeable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Common elements for swipe actions
const LeftElement = () => (
  <View style={tailwind.style('flex-row items-center')}>
    <Text style={tailwind.style('text-white text-base font-medium')}>Archive</Text>
  </View>
);

const RightElement = () => (
  <View style={tailwind.style('flex-row items-center')}>
    <Text style={tailwind.style('text-white text-base font-medium')}>Delete</Text>
  </View>
);

const SwipeableContent = () => (
  <View style={tailwind.style('bg-white p-4 border-b border-gray-200')}>
    <Text style={tailwind.style('text-base')}>Swipe me left or right</Text>
  </View>
);

export const Basic: Story = {
  // @ts-expect-error: openedRowIndex is not required in the props
  args: {
    index: 0,
    spacing: 16,
    handlePress: () => alert('pressed'),
    leftElement: <LeftElement />,
    rightElement: <RightElement />,
    children: <SwipeableContent />,
  },
  render: args => (
    <SwipeableWrapper>
      {openedRowIndex => (
        <Swipeable {...args} openedRowIndex={openedRowIndex}>
          {args.children}
        </Swipeable>
      )}
    </SwipeableWrapper>
  ),
};
export const LeftSwipeOnly: Story = {
  ...Basic,
  args: {
    ...Basic.args,
    rightElement: null,
  },
};

export const RightSwipeOnly: Story = {
  ...Basic,
  args: {
    ...Basic.args,
    leftElement: null,
  },
};

export const WithOverswipe: Story = {
  ...Basic,
  args: {
    ...Basic.args,
    triggerOverswipeOnFlick: true,
    handleOnLeftOverswiped: () => alert('left over swiped'),
    handleOnRightOverswiped: () => alert('right over swiped'),
  },
};

export const WithLongPress: Story = {
  ...Basic,
  args: {
    ...Basic.args,
    handleLongPress: () => alert('long pressed'),
  },
};

export const WithCustomSpacing: Story = {
  ...Basic,
  args: {
    ...Basic.args,
    spacing: 32,
  },
};
