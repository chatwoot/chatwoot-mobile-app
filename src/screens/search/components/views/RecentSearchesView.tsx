import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components-next/common/icon';
import { tailwind } from '@/theme';
import { IOS_DESIGN } from '@/utils';
import i18n from 'i18n';
import { ClockIcon } from '../shared/ClockIcon';

interface RecentSearchesViewProps {
  recentSearches: string[];
  onSearchSelect: (query: string) => void;
  onClear: () => void;
}

export function RecentSearchesView({
  recentSearches,
  onSearchSelect,
  onClear,
}: RecentSearchesViewProps) {
  if (IOS_DESIGN) {
    // iOS search history: a section header with a blue Clear action, then plain list rows
    // with a clock and hairline dividers inset from the text.
    return (
      <View>
        <View style={tailwind.style('flex-row items-center justify-between px-4 pt-3 pb-1.5')}>
          <Text
            accessibilityRole="header"
            style={tailwind.style('text-[13px] leading-[18px] font-inter-medium-24 text-gray-700')}>
            {i18n.t('SEARCH.RECENT_SEARCHES')}
          </Text>
          <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button">
            <Text
              style={tailwind.style(
                'text-[15px] leading-[20px] font-inter-normal-20 text-blue-800',
              )}>
              {i18n.t('SEARCH.CLEAR_ALL')}
            </Text>
          </Pressable>
        </View>
        {recentSearches.map((item, index) => (
          <Pressable
            key={item}
            onPress={() => onSearchSelect(item)}
            accessibilityRole="button"
            style={({ pressed }) =>
              tailwind.style('flex-row items-center pl-4', pressed && 'bg-gray-100')
            }>
            <Icon icon={<ClockIcon stroke={tailwind.color('text-gray-700')} />} size={20} />
            <View
              style={tailwind.style(
                'flex-1 ml-3 py-[11px] pr-4',
                index < recentSearches.length - 1 && 'border-b-[0.5px] border-b-blackA-A6',
              )}>
              <Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-[17px] leading-[22px] font-inter-normal-20 text-gray-950',
                )}>
                {item}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View>
      <View style={tailwind.style('flex-row items-center justify-between px-6 pb-2 pt-6 mb-2')}>
        <Text
          style={tailwind.style(
            'text-md font-inter-medium-24 leading-[17px] tracking-[0.16px] text-gray-700',
          )}>
          {i18n.t('SEARCH.RECENT_SEARCHES')}
        </Text>
        <Pressable onPress={onClear}>
          <Text
            style={tailwind.style(
              'text-xs font-inter-medium-24 leading-[17px] tracking-[0.16px] text-blue-800',
            )}>
            {i18n.t('SEARCH.CLEAR_ALL')}
          </Text>
        </Pressable>
      </View>
      {recentSearches.map(item => (
        <Pressable
          key={item}
          onPress={() => onSearchSelect(item)}
          style={tailwind.style('px-6 py-2 mb-2')}>
          <Text
            style={tailwind.style(
              'text-md font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
            )}>
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
