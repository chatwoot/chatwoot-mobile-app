import React from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  FullWidthButton,
  GenericList,
  Icon,
  LabelSection,
  OtherConversationDetails,
  PreviousConversationList,
} from '@/components-next';
import { TAB_BAR_HEIGHT } from '../../constants';
import {
  ChatIcon,
  FacebookIcon,
  MailIcon,
  Overflow,
  PhoneIcon,
  TelegramIcon,
  WebsiteIcon,
  WhatsAppIcon,
} from '../../svg-icons';
import { tailwind } from '../../theme';
import { GenericListType, LabelType } from '../../types';
import { useHaptic, useScaleAnimation } from '../../utils';

import { ContactDetailsScreenHeader } from './ContactDetailsScreenHeader';

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

const ContactOptions = () => {
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

const userDetails: GenericListType[] = [
  {
    icon: <TelegramIcon />,
    subtitle: 'Chennai, India',
    title: 'Location',
    subtitleType: 'dark',
  },
  {
    icon: <WhatsAppIcon />,
    subtitle: '+91 95290 12950',
    title: 'Phone',
    subtitleType: 'dark',
  },
  {
    icon: <FacebookIcon />,
    subtitle: 'jacobjones@gmail.com',
    title: 'Email',
    subtitleType: 'dark',
  },
  {
    icon: <WebsiteIcon />,
    subtitle: 'jacobjones.co',
    title: 'Website',
    subtitleType: 'dark',
  },
];

const labels: LabelType[] = [
  {
    labelColor: 'bg-yellow-800',
    labelText: 'Premium',
  },
  {
    labelColor: 'bg-pink-800',
    labelText: 'Subscriber',
  },
  {
    labelColor: 'bg-green-800',
    labelText: 'Lead',
  },
];

const ContactDetailsScreen = () => {
  return (
    <View style={tailwind.style('flex-1 bg-white pt-6')}>
      <ContactDetailsScreenHeader />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
        <ContactOptions />
        <Animated.View style={tailwind.style('pt-10')}>
          <GenericList list={userDetails} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <LabelSection labelList={labels} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <PreviousConversationList />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <OtherConversationDetails />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <FullWidthButton isDestructive text="Delete contact" />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

export default ContactDetailsScreen;
