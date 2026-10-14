import React, { useMemo, useRef } from 'react';
import { Dimensions, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, IconButton } from '@/components-next';

import { MailIcon, PhoneIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import i18n from '@/i18n';
import { openNumber, openEmail } from '@/utils/urlUtils';
import { useAppDispatch, useAppSelector } from '@/hooks';
import type { SheetRef } from '@/components-next/common/sheet/Sheet';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import type { CallerSnapshot } from '@/store/call/callTypes';
import { placeOutboundCall } from '@/utils/placeOutboundCall';

import { buildContactCallOptions, type ContactCallOption } from '../utils/contactCallOptions';
import { ContactCallSheet } from './ContactCallSheet';

type ContactOption = {
  contactType: 'call' | 'email';
  icon: React.ReactNode;
};

type ContactOptionProps = {
  option: ContactOption;
  handleOptionPress?: () => void;
};

const SCREEN_WIDTH = Dimensions.get('screen').width;
const OPTION_WIDTH = (SCREEN_WIDTH - 32 - 12 * 3) / 2;

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

type ContactBasicActionsProps = {
  phoneNumber?: string;
  email?: string;
  contactId?: number;
  // The conversation the contact was opened from, if any
  conversation?: { id: number; inboxId?: number } | null;
  caller?: CallerSnapshot | null;
  style?: StyleProp<ViewStyle>;
};

export const ContactBasicActions = (props: ContactBasicActionsProps) => {
  const { phoneNumber, email, contactId, conversation, caller, style } = props;
  const dispatch = useAppDispatch();
  const inboxes = useAppSelector(selectAllInboxes);
  const callSheetRef = useRef<SheetRef>(null);
  const selectedOptionRef = useRef<ContactCallOption | null>(null);

  const callOptions = useMemo(
    () =>
      contactId
        ? buildContactCallOptions(inboxes, conversation, !!phoneNumber)
        : phoneNumber
          ? [{ type: 'dialer' } as ContactCallOption]
          : [],
    [contactId, inboxes, conversation, phoneNumber],
  );

  const callThrough = (option: ContactCallOption) => {
    if (option.type === 'dialer') {
      if (phoneNumber) openNumber({ phoneNumber });
      return;
    }
    placeOutboundCall(dispatch, {
      provider: option.provider,
      inboxId: option.inbox.id,
      conversationId: option.conversationId,
      contactId,
      caller,
    });
  };

  // With more than one way to call, the agent picks one; a single way is used directly
  const onCallPress = () => {
    if (callOptions.length > 1) {
      callSheetRef.current?.present();
      return;
    }
    if (callOptions[0]) callThrough(callOptions[0]);
  };

  // The choice is acted on once the sheet is gone, so the call screen is not opened under it
  const onCallOptionSelect = (option: ContactCallOption) => {
    selectedOptionRef.current = option;
    callSheetRef.current?.dismiss();
  };

  const onCallSheetDismiss = () => {
    const option = selectedOptionRef.current;
    selectedOptionRef.current = null;
    if (option) callThrough(option);
  };

  const callSheet =
    callOptions.length > 1 ? (
      <ContactCallSheet
        ref={callSheetRef}
        options={callOptions}
        onSelect={onCallOptionSelect}
        onDismiss={onCallSheetDismiss}
      />
    ) : null;

  const onEmailPress = () => {
    if (!email) {
      return;
    }
    openEmail({ email });
  };

  const canCall = callOptions.length > 0;
  if (!email && !canCall) {
    return null;
  }

  if (email && canCall) {
    return (
      <Animated.View style={[tailwind.style('flex flex-row justify-between '), style]}>
        <ContactOptionComponent
          key="email"
          option={{
            contactType: i18n.t('CONTACT_DETAILS.EMAIL'),
            icon: <MailIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
          }}
          handleOptionPress={onEmailPress}
        />
        <ContactOptionComponent
          key="call"
          option={{
            contactType: i18n.t('CONTACT_DETAILS.CALL'),
            icon: <PhoneIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
          }}
          handleOptionPress={onCallPress}
        />
        {callSheet}
      </Animated.View>
    );
  }

  if (canCall) {
    return (
      <Animated.View style={style}>
        <IconButton
          text={i18n.t('CONTACT_DETAILS.CALL')}
          variant="secondary"
          handlePress={onCallPress}
        />
        {callSheet}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={style}>
      <IconButton
        text={i18n.t('CONTACT_DETAILS.EMAIL')}
        variant="secondary"
        handlePress={onEmailPress}
      />
    </Animated.View>
  );
};
