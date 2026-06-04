import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import i18n from '@/i18n';
import { tailwind } from '@/theme';
import type { Contact } from '@/types/Contact';
import { getContactName } from '@/utils/contactDisplayUtils';

type DialContactMatchProps = {
  contact?: Contact;
  hasDialedNumber: boolean;
  onPress?: (contact: Contact) => void;
};

export const DialContactMatch = ({ contact, hasDialedNumber, onPress }: DialContactMatchProps) => {
  if (!contact) {
    if (!hasDialedNumber) {
      return null;
    }

    return (
      <Animated.Text
        numberOfLines={1}
        style={tailwind.style('text-sm font-inter-420-20 text-gray-700 text-center')}>
        {i18n.t('DIAL.NO_MATCHING_CONTACT')}
      </Animated.Text>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(contact)}
      style={({ pressed }) =>
        tailwind.style('items-center rounded-lg px-3 py-1', pressed ? 'bg-gray-50' : '')
      }>
      <Animated.Text
        numberOfLines={1}
        style={tailwind.style('text-sm font-inter-medium-24 text-gray-950 text-center')}>
        {getContactName(contact)}
      </Animated.Text>
      {!!contact.phoneNumber && (
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style('text-xs font-inter-420-20 text-gray-700 pt-1 text-center')}>
          {contact.phoneNumber}
        </Animated.Text>
      )}
    </Pressable>
  );
};
