import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { tailwind } from '@/theme';
import i18n from 'i18n';

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
