import React from 'react';
import { Dimensions, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from '@/components-next';
import { ChatIcon, MailIcon, Overflow, PhoneIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';

// Add onPress callbacks to the options
const contactOptions = [
  {
    contactType: 'call',
    icon: <PhoneIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
  },
  {
    contactType: 'message',
    icon: <ChatIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
  },
  {
    contactType: 'email',
    icon: <MailIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
  },
  {
    contactType: 'more',
    icon: <Overflow strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
  },
];

type ContactOptionProps = {
  index: number;
  option: (typeof contactOptions)[0];
  handleOptionPress?: () => void;
};

const SCREEN_WIDTH = Dimensions.get('screen').width;
const OPTION_WIDTH = (SCREEN_WIDTH - 32 - 12 * 3) / 4;

const ContactOption = (props: ContactOptionProps) => {
  const { index, option, handleOptionPress } = props;

  const { handlers, animatedStyle } = useScaleAnimation();
  const hapticSelection = useHaptic();

  const handleOnPress = () => {
    hapticSelection?.();
    handleOptionPress?.();
  };

  return (
    <Animated.View
      style={[
        tailwind.style('flex-1', index !== contactOptions.length - 1 ? 'mr-3' : ''),
        animatedStyle,
      ]}>
      <Pressable
        style={({ pressed }) => [
          tailwind.style(
            'flex items-center justify-center flex-1 rounded-xl bg-gray-50 py-3',
            `w-[${OPTION_WIDTH}px]`,
            pressed ? 'bg-gray-100' : '',
          ),
        ]}
        onPress={handleOnPress}
        {...handlers}>
        <Icon icon={option.icon} size={24} />
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style(
            'text-cxs font-inter-medium-24 leading-[15px] tracking-[0.32px] text-center text-blue-800 pt-2',
          )}>
          {option.contactType}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

export const ContactBasicActions = () => {
  return (
    <Animated.View style={tailwind.style('mt-[23px]')}>
      <Animated.View style={tailwind.style('flex flex-row justify-between px-4')}>
        {contactOptions.map((option, index) => (
          <ContactOption key={index} {...{ option, index }} />
        ))}
      </Animated.View>
    </Animated.View>
  );
};
