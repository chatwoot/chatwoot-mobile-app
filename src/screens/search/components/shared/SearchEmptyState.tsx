import React from 'react';
import { Pressable } from 'react-native';

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { BaseAnimationBuilder } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { InfoIcon, SearchIcon } from '@/svg-icons';
import { Icon } from '@/components-next';
import { IOS_DESIGN } from '@/utils';
import i18n from 'i18n';

interface SearchEmptyStateProps {
  sectionLabel: string;
  searchQuery: string;
  errorMessage?: string;
  onRetry?: () => void;
  entering?: BaseAnimationBuilder;
  exiting?: BaseAnimationBuilder;
  // iOS: a one-line note under a section header in the All view instead of a page state.
  inline?: boolean;
}

export function SearchEmptyState({
  sectionLabel,
  searchQuery,
  errorMessage,
  onRetry,
  entering = FadeIn.duration(300),
  exiting = FadeOut.duration(200),
  inline = false,
}: SearchEmptyStateProps) {
  const message =
    errorMessage ||
    i18n.t('SEARCH.NO_RESULTS', { sectionLabel: sectionLabel.toLowerCase(), searchQuery });

  if (IOS_DESIGN) {
    const retry = onRetry ? (
      <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button">
        <Animated.Text
          style={tailwind.style('text-[15px] leading-[20px] font-inter-medium-24 text-blue-800')}>
          {i18n.t('SEARCH.TAP_TO_RETRY')}
        </Animated.Text>
      </Pressable>
    ) : null;

    if (inline) {
      return (
        <Animated.View
          entering={entering}
          exiting={exiting}
          style={tailwind.style('px-4 pt-1 pb-3 flex-row flex-wrap items-center gap-x-2')}>
          <Animated.Text
            style={tailwind.style('text-[15px] leading-[20px] font-inter-normal-20 text-gray-700')}>
            {message}
          </Animated.Text>
          {retry}
        </Animated.View>
      );
    }

    // Compact page state like the split view's empty states: small icon, 15pt text.
    return (
      <Animated.View
        entering={entering}
        exiting={exiting}
        style={tailwind.style('pt-16 px-8 items-center gap-3')}>
        <Icon
          icon={
            errorMessage ? <InfoIcon /> : <SearchIcon stroke={tailwind.color('text-gray-700')} />
          }
          size={28}
        />
        <Animated.Text
          style={tailwind.style(
            'max-w-[400px] text-[15px] leading-[20px] font-inter-normal-20 text-gray-700 text-center',
          )}>
          {message}
        </Animated.Text>
        {retry}
      </Animated.View>
    );
  }

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
          {message}
        </Animated.Text>
      </Animated.View>
      {onRetry && (
        <Pressable onPress={onRetry}>
          <Animated.Text
            style={tailwind.style('text-sm font-inter-420-20 tracking-[0.32px] text-blue-800')}>
            {i18n.t('SEARCH.TAP_TO_RETRY')}
          </Animated.Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
