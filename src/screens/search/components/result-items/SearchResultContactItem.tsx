import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components-next/common/avatar';
import { tailwind } from '@/theme';
import type { Contact } from '@/types/Contact';
import { HighlightedText } from '../shared/HighlightedText';
import { expandTabs } from '@/utils/expandTabs';
import { IOS_DESIGN, IOS_LIST_TEXT, useScaleAnimation } from '@/utils';

type SearchResultContactItemProps = {
  contact: Contact;
  searchQuery: string;
  onPress: () => void | Promise<void>;
  isLast?: boolean;
};

export const SearchResultContactItem = ({
  contact,
  searchQuery,
  onPress,
  isLast = false,
}: SearchResultContactItemProps) => {
  const city = contact.additionalAttributes?.city;
  const country = contact.additionalAttributes?.country;

  const formattedLocation = [city, country].filter(Boolean).join(', ');

  const { animatedStyle, handlers } = useScaleAnimation();

  const contactInfoItems = useMemo(() => {
    const items: { type: 'text' | 'separator'; content?: string; isHighlighted?: boolean }[] = [];

    if (contact.email) {
      items.push({
        type: 'text',
        content: contact.email,
        isHighlighted: true,
      });
    }

    if (contact.email && contact.phoneNumber) {
      items.push({ type: 'separator' });
    }

    if (contact.phoneNumber) {
      items.push({
        type: 'text',
        content: contact.phoneNumber,
        isHighlighted: true,
      });
    }

    if ((contact.email || contact.phoneNumber) && formattedLocation) {
      items.push({ type: 'separator' });
    }

    if (formattedLocation) {
      items.push({
        type: 'text',
        content: formattedLocation,
        isHighlighted: false,
      });
    }

    return items;
  }, [contact.email, contact.phoneNumber, formattedLocation]);

  if (IOS_DESIGN) {
    // iOS list row like the conversation list: 40pt avatar, 17pt name, 15pt details and a
    // hairline divider that starts at the text.
    const detailStyle = tailwind.style(
      'font-inter-normal-20 text-gray-700 flex-shrink',
      IOS_LIST_TEXT.body,
    );
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => tailwind.style('flex-row pl-4', pressed && 'bg-gray-100')}>
        <Animated.View style={tailwind.style('py-3')}>
          <Avatar
            src={contact.thumbnail ? { uri: contact.thumbnail } : undefined}
            name={contact.name || ''}
            size="2xl"
            initialsClassName="text-[14px]"
          />
        </Animated.View>
        <Animated.View
          style={tailwind.style(
            'flex-1 ml-3 py-3 pr-4 gap-0.5 justify-center',
            !isLast && 'border-b-[0.5px] border-b-blackA-A6',
          )}>
          <HighlightedText
            text={contact.name || ''}
            searchQuery={searchQuery}
            style={tailwind.style('text-gray-950', IOS_LIST_TEXT.title, IOS_LIST_TEXT.readTitle)}
            numberOfLines={1}
          />
          {contactInfoItems.length > 0 && (
            <Animated.View style={tailwind.style('flex-row flex-wrap items-center gap-x-1.5')}>
              {contactInfoItems.map((item, index) =>
                item.type === 'separator' ? (
                  <Animated.Text key={`separator-${index}`} style={detailStyle}>
                    ·
                  </Animated.Text>
                ) : item.isHighlighted ? (
                  <HighlightedText
                    key={`text-${index}`}
                    text={item.content || ''}
                    searchQuery={searchQuery}
                    style={detailStyle}
                    numberOfLines={1}
                  />
                ) : (
                  <Animated.Text key={`text-${index}`} style={detailStyle} numberOfLines={1}>
                    {expandTabs(item.content || '')}
                  </Animated.Text>
                ),
              )}
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tailwind.style(
          'flex-row items-start px-4 py-3',
          !isLast && 'border-b border-b-blackA-A3',
          pressed ? 'bg-gray-50' : '',
        ),
      ]}
      {...handlers}>
      <Animated.View style={[animatedStyle, tailwind.style('mt-1')]}>
        <Avatar
          src={contact.thumbnail ? { uri: contact.thumbnail } : undefined}
          name={contact.name || ''}
          size="md"
        />
      </Animated.View>
      <Animated.View style={tailwind.style('flex-1 ml-3')}>
        <Animated.View style={tailwind.style('flex-row items-center justify-between mb-1.5')}>
          <HighlightedText
            text={contact.name || ''}
            searchQuery={searchQuery}
            style={tailwind.style(
              'text-sm font-inter-medium-24 leading-[17px] text-gray-950 flex-1',
            )}
            numberOfLines={1}
          />
        </Animated.View>
        <Animated.View style={tailwind.style('flex-row flex-wrap items-center gap-x-2 gap-y-1.5')}>
          {contactInfoItems.map((item, index) => {
            if (item.type === 'separator') {
              return (
                <Animated.View
                  key={`separator-${index}`}
                  style={tailwind.style('w-px h-3 bg-gray-300')}
                />
              );
            }
            const textStyle = tailwind.style(
              'text-sm font-inter-420-20 leading-[17px] text-gray-800',
            );
            return item.isHighlighted ? (
              <HighlightedText
                key={`text-${index}`}
                text={item.content || ''}
                searchQuery={searchQuery}
                style={textStyle}
                numberOfLines={1}
              />
            ) : (
              <Animated.Text key={`text-${index}`} style={textStyle} numberOfLines={1}>
                {expandTabs(item.content || '')}
              </Animated.Text>
            );
          })}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
