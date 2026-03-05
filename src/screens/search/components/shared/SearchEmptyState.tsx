import React from 'react';

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { BaseAnimationBuilder } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { InfoIcon } from '@/svg-icons';
import { Icon } from '@/components-next';

interface SearchEmptyStateProps {
  sectionLabel: string;
  searchQuery: string;
  entering?: BaseAnimationBuilder;
  exiting?: BaseAnimationBuilder;
}

export function SearchEmptyState({
  sectionLabel,
  searchQuery,
  entering = FadeIn.duration(300),
  exiting = FadeOut.duration(200),
}: SearchEmptyStateProps) {
  const content = (
    <Animated.View style={tailwind.style('flex-row items-center gap-2')}>
      <Icon icon={<InfoIcon />} size={20} />
      <Animated.Text
        style={tailwind.style(
          'text-sm font-inter-420-20 tracking-[0.32px] text-gray-800 text-center',
        )}>
        No {sectionLabel.toLowerCase()} found for query '{searchQuery}'
      </Animated.Text>
    </Animated.View>
  );

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={tailwind.style('px-4 py-6 items-center')}>
      {content}
    </Animated.View>
  );
}
