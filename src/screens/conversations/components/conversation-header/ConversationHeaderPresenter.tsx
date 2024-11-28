import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { withDelay, withSpring } from 'react-native-reanimated';
import { Icon } from '@/components-next/common';
import { CheckedIcon, CloseIcon, FilterIcon, UncheckedIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useScaleAnimation } from '@/utils';

type ConversationHeaderPresenterProps = {
  currentState: 'Search' | 'Filter' | 'Select' | 'none';
  isSelectedAll: boolean;
  filtersAppliedCount: number;
  onLeftIconPress: () => void;
  onRightIconPress: () => void;
  onClearFilter: () => void;
};

export const ConversationHeaderPresenter = ({
  currentState,
  isSelectedAll,
  filtersAppliedCount,
  onLeftIconPress,
  onRightIconPress,
  onClearFilter,
}: ConversationHeaderPresenterProps) => {
  const { handlers, animatedStyle } = useScaleAnimation();

  const entering = () => {
    'worklet';
    const animations = {
      opacity: withDelay(200, withSpring(1)),
      transform: [{ scale: withDelay(200, withSpring(1)) }],
    };
    const initialValues = {
      opacity: 0,
      transform: [{ scale: 0.95 }],
    };
    return {
      initialValues,
      animations,
    };
  };

  const exiting = () => {
    'worklet';
    const animations = {
      opacity: withSpring(0),
      transform: [{ scale: withSpring(0.95) }],
    };
    const initialValues = {
      opacity: 1,
      transform: [{ scale: 1 }],
    };
    return {
      initialValues,
      animations,
    };
  };

  return (
    <Animated.View
      style={[tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]')]}>
      {currentState !== 'Filter' && currentState !== 'Search' ? (
        currentState === 'Select' ? (
          <Animated.View style={tailwind.style('flex-1 items-start')}>
            <Pressable onPress={onLeftIconPress} hitSlop={16}>
              <Animated.View exiting={exiting} entering={entering}>
                <Icon
                  size={24}
                  icon={
                    isSelectedAll ? (
                      <CheckedIcon />
                    ) : (
                      <UncheckedIcon stroke={tailwind.color('text-gray-800')} />
                    )
                  }
                />
              </Animated.View>
            </Pressable>
          </Animated.View>
        ) : null
      ) : null}
      {currentState !== 'Filter' && currentState !== 'Select' ? (
        currentState === 'Search' ? null : (
          <Animated.View style={tailwind.style('flex-1 items-start')}>
            <Pressable hitSlop={16}>
              <Animated.View exiting={exiting} entering={entering} />
            </Pressable>
          </Animated.View>
        )
      ) : null}
      {currentState === 'Filter' ? (
        <Animated.View
          style={[tailwind.style('flex-1'), animatedStyle]}
          exiting={exiting}
          entering={entering}>
          <Pressable onPress={onClearFilter} disabled={filtersAppliedCount === 0} {...handlers}>
            <Text
              style={tailwind.style(
                'text-md font-inter-medium-24 leading-[17px] tracking-[0.24px]',
                filtersAppliedCount === 0 ? 'text-gray-700' : 'text-blue-800',
              )}>
              {i18n.t('CONVERSATION.HEADER.CLEAR_FILTER')}
              {filtersAppliedCount === 0 ? '' : ` (${filtersAppliedCount})`}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
      <Animated.View style={tailwind.style('flex-1')}>
        <Text
          style={tailwind.style(
            'text-[17px] font-inter-medium-24 tracking-[0.32px] leading-[17px] text-center text-gray-950',
          )}>
          {i18n.t('CONVERSATION.HEADER.TITLE')}
        </Text>
      </Animated.View>
      <Animated.View style={tailwind.style('flex-1 items-end')}>
        <Pressable onPress={onRightIconPress} hitSlop={16}>
          {currentState === 'Filter' || currentState === 'Select' ? (
            <Animated.View exiting={exiting} entering={entering}>
              <Icon size={24} icon={<CloseIcon />} />
            </Animated.View>
          ) : (
            <Animated.View exiting={exiting} entering={entering}>
              {filtersAppliedCount !== 0 ? (
                <Animated.View
                  style={tailwind.style(
                    'absolute z-10 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-800',
                  )}
                />
              ) : null}
              <Icon size={24} icon={<FilterIcon />} />
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};
