import React from 'react';
import { Pressable } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { BaseAnimationBuilder } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { InfoIcon } from '@/svg-icons';
import { Icon } from '@/components-next';
import i18n from 'i18n';

interface SearchEmptyStateProps {
  sectionLabel: string;
  searchQuery: string;
  errorMessage?: string;
  onRetry?: () => void;
  entering?: BaseAnimationBuilder;
  exiting?: BaseAnimationBuilder;
}

export function SearchEmptyState({
  sectionLabel,
  searchQuery,
  errorMessage,
  onRetry,
  entering = FadeIn.duration(300),
  exiting = FadeOut.duration(200),
}: SearchEmptyStateProps) {
  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={tailwind.style('px-4 py-6 items-center gap-3')}>
      <Animated.View style={tailwind.style('flex-row items-center gap-2')}>
        <Icon icon={<InfoIcon />} size={20} />
        <Animated.Text
          style={tailwind.style(
            'text-sm font-inter-420-20 tracking-[0.32px] text-gray-800 text-center',
          )}>
          {errorMessage || i18n.t('SEARCH.NO_RESULTS', { sectionLabel: sectionLabel.toLowerCase(), searchQuery })}
        </Animated.Text>
      </Animated.View>
      {onRetry && (
        <Pressable onPress={onRetry}>
          <Animated.Text
            style={tailwind.style(
              'text-sm font-inter-420-20 tracking-[0.32px] text-blue-800',
            )}>
            {i18n.t('SEARCH.TAP_TO_RETRY')}
          </Animated.Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
