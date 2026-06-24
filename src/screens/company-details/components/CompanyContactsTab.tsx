import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import { CaretRight } from '@/svg-icons';
import type { CompanyContact } from '@/types/Company';
import { tailwind } from '@/theme';

type CompanyContactsTabProps = {
  contacts: CompanyContact[];
  isLoading?: boolean;
  onContactPress: (contact: CompanyContact) => void;
};

export const CompanyContactsTab = ({
  contacts,
  isLoading = false,
  onContactPress,
}: CompanyContactsTabProps) => {
  return (
    <Animated.View style={tailwind.style('px-4 pt-4 gap-3')}>
      {isLoading ? (
        <Animated.Text
          style={tailwind.style(
            'text-base font-inter-normal-20 leading-[22px] text-gray-900 text-center py-6',
          )}>
          Loading contacts
        </Animated.Text>
      ) : null}
      {!isLoading && contacts.length === 0 ? (
        <Animated.Text
          style={tailwind.style(
            'text-base font-inter-normal-20 leading-[22px] text-gray-900 text-center py-6',
          )}>
          No contacts yet
        </Animated.Text>
      ) : null}
      {contacts.map(contact => (
        <Pressable
          key={contact.id}
          onPress={() => onContactPress(contact)}
          style={({ pressed }) =>
            tailwind.style(
              'rounded-[13px] bg-gray-50 px-3 py-3 flex-row items-center',
              pressed ? 'bg-gray-100' : '',
            )
          }>
          <Avatar
            size="md"
            src={contact.thumbnail ? { uri: contact.thumbnail } : undefined}
            name={contact.name}
          />
          <Animated.View style={tailwind.style('ml-3 flex-1')}>
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style('text-base font-inter-580-24 leading-[22px] text-gray-950')}>
              {contact.name}
            </Animated.Text>
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style('text-sm font-inter-normal-20 leading-[18px] text-gray-900')}>
              {contact.email || contact.phoneNumber || 'Unavailable'}
            </Animated.Text>
          </Animated.View>
          <Icon icon={<CaretRight />} size={20} />
        </Pressable>
      ))}
    </Animated.View>
  );
};
