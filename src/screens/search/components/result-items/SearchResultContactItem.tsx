import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Avatar } from '@/components-next/common/avatar';
import { tailwind } from '@/theme';
import type { Contact } from '@/types/Contact';
import { HighlightedText } from '../shared/HighlightedText';
import { useScaleAnimation } from '@/utils';
import { LastActivityTime } from '@/screens/conversations/components/conversation-item/LastActivityTime';

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
  const updatedAt = contact.lastActivityAt;
  const city = contact.additionalAttributes?.city;
  const country = contact.additionalAttributes?.country;

  const formattedLocation = [city, country].filter(Boolean).join(', ');

  const { animatedStyle, handlers } = useScaleAnimation();

  const contactInfoItems = useMemo(() => {
    const items: Array<{ type: 'text' | 'separator'; content?: string; isHighlighted?: boolean }> = [];
    
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

  return (
    <Animated.View entering={FadeIn.duration(200)}>
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
          <Animated.View
            style={tailwind.style('flex-row items-center justify-between mb-1.5')}>
            <HighlightedText
              text={contact.name || ''}
              searchQuery={searchQuery}
              style={tailwind.style(
                'text-sm font-inter-medium-24 leading-[17px] text-gray-950 flex-1',
              )}
              numberOfLines={1}
            />
            {updatedAt && (
              <LastActivityTime timestamp={updatedAt} />
            )}
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
                <Animated.Text
                  key={`text-${index}`}
                  style={textStyle}
                  numberOfLines={1}>
                  {item.content || ''}
                </Animated.Text>
              );
            })}
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
