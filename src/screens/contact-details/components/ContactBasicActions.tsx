import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, IconButton } from '@/components-next';

import { MailIcon, PhoneIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import i18n from '@/i18n';
import { openNumber, openEmail } from '@/utils/urlUtils';

type ContactOption = {
  contactType: 'call' | 'email';
  icon: React.ReactNode;
};

type ContactOptionProps = {
  option: ContactOption;
  handleOptionPress?: () => void;
};

const ContactOptionComponent = (props: ContactOptionProps) => {
  const { option, handleOptionPress } = props;

  const { handlers, animatedStyle } = useScaleAnimation();
  const hapticSelection = useHaptic();

  const handleOnPress = () => {
    hapticSelection?.();
    handleOptionPress?.();
  };

  return (
    <Animated.View style={[tailwind.style('flex-1'), animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          tailwind.style(
            'flex items-center justify-center w-full rounded-xl bg-gray-50 py-3',
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

type ContactBasicActionsProps = {
  phoneNumber?: string;
  email?: string;
};

export const ContactBasicActions = (props: ContactBasicActionsProps) => {
  const { phoneNumber, email } = props;

  const onCallPress = () => {
    openNumber({ phoneNumber });
  };

  const onEmailPress = () => {
    openEmail({ email });
  };

  if (!email && !phoneNumber) {
    return null;
  }

  if (email && phoneNumber) {
    return (
      <Animated.View style={tailwind.style('flex flex-row justify-between gap-1')}>
        <ContactOptionComponent
          key="email"
          option={{
            contactType: i18n.t('CONTACT_DETAILS.EMAIL'),
            icon: <MailIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
          }}
          handleOptionPress={onEmailPress}
        />
        <ContactOptionComponent
          key="phoneNumber"
          option={{
            contactType: i18n.t('CONTACT_DETAILS.CALL'),
            icon: <PhoneIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
          }}
          handleOptionPress={onCallPress}
        />
      </Animated.View>
    );
  }

  if (phoneNumber) {
    return (
      <IconButton
        text={i18n.t('CONTACT_DETAILS.CALL')}
        variant="secondary"
        handlePress={onCallPress}
      />
    );
  }

  if (email) {
    return (
      <IconButton
        text={i18n.t('CONTACT_DETAILS.EMAIL')}
        variant="secondary"
        handlePress={onEmailPress}
      />
    );
  }
};
