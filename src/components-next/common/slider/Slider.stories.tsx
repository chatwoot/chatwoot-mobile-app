import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { tailwind } from '@/theme';
import { useEffect } from 'react';

import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Slider',
  component: Slider,
  decorators: [
    Story => (
      <View style={{ padding: 20, width: '100%', maxWidth: 400 }}>
        <View style={tailwind.style('w-full flex flex-row items-center flex-1')}>
          <Story />
        </View>
      </View>
    ),
  ],
  argTypes: {
    trackColor: {
      control: 'color',
      description: 'Color of the track',
    },
    filledTrackColor: {
      control: 'color',
      description: 'Color of the filled portion of the track',
    },
    knobStyle: {
      control: 'text',
      description: 'Additional styles for the knob',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

type SliderProps = {
  trackColor: string;
  filledTrackColor: string;
  knobStyle: string;
};

const SliderWithState = (args: SliderProps) => {
  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(100);

  const handleManualSeek = (position: number) => {
    currentPosition.value = position;
  };

  const handlePause = () => {
    console.log('Audio paused');
  };

  return (
    <Slider
      {...args}
      currentPosition={currentPosition}
      totalDuration={totalDuration}
      manualSeekTo={handleManualSeek}
      pauseAudio={handlePause}
    />
  );
};

const HalfwayProgressSlider = (args: SliderProps) => {
  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(100);

  useEffect(() => {
    // Set initial position after a small delay to ensure layout is measured
    const timer = setTimeout(() => {
      currentPosition.value = 50;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleManualSeek = (position: number) => {
    currentPosition.value = position;
  };

  const handlePause = () => {
    console.log('Audio paused');
  };

  return (
    <Slider
      {...args}
      currentPosition={currentPosition}
      totalDuration={totalDuration}
      manualSeekTo={handleManualSeek}
      pauseAudio={handlePause}
    />
  );
};

export const Basic: Story = {
  render: args => <SliderWithState {...args} />,
  args: {
    trackColor: 'bg-gray-500',
    filledTrackColor: 'bg-blue-700',
    knobStyle: 'border-blue-700',
  },
};

export const HalfwayProgress: Story = {
  render: args => <HalfwayProgressSlider {...args} />,
  args: {
    trackColor: 'bg-gray-500',
    filledTrackColor: 'bg-blue-700',
    knobStyle: 'border-blue-700',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Slider showing 50% progress state. The knob should be positioned in the middle of the track.',
      },
    },
  },
};

export const CustomColors: Story = {
  render: args => <SliderWithState {...args} />,
  args: {
    trackColor: 'bg-purple-200',
    filledTrackColor: 'bg-purple-600',
    knobStyle: 'border-purple-600',
  },
};
