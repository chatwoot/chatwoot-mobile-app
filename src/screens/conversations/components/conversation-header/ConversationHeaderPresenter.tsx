import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import Animated, {
  AnimatedStyle,
  useAnimatedStyle,
  useDerivedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Icon } from '@/components-next/common';
import { CheckedIcon, CloseIcon, FilterIcon, UncheckedIcon, SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useScaleAnimation } from '@/utils';
import { useHeaderAnimation } from '@/hooks/useHeaderAnimation';

type HeaderState = 'Search' | 'Filter' | 'Select' | 'none';

type ConversationHeaderPresenterProps = {
  currentState: HeaderState;
  isSelectedAll: boolean;
  filtersAppliedCount: number;
  onLeftIconPress: () => void;
  onRightIconPress: () => void;
  onClearFilter: () => void;
};

type RightSectionProps = {
  currentState: HeaderState;
  filtersAppliedCount: number;
  onRightIconPress: () => void;
};

type LeftSlotProps = {
  currentState: HeaderState;
  isSelectedAll: boolean;
  filtersAppliedCount: number;
  onLeftIconPress: () => void;
  onClearFilter: () => void;
  handlers: Record<string, unknown>;
  animatedStyle: ViewStyle | AnimatedStyle<ViewStyle>;
};

const HeaderTitle = () => (
  <Animated.View style={tailwind.style('flex-2')}>
    <Text
      numberOfLines={1}
      style={tailwind.style(
        'text-[17px] font-inter-medium-24 tracking-[0.32px] leading-[17px] text-center text-gray-950',
      )}>
      {i18n.t('CONVERSATION.HEADER.TITLE')}
    </Text>
  </Animated.View>
);

const CROSSFADE_MS = 180;

const LeftSlot = ({
  currentState,
  isSelectedAll,
  filtersAppliedCount,
  onLeftIconPress,
  onClearFilter,
  handlers,
  animatedStyle,
}: LeftSlotProps) => {
  const searchActive = currentState === 'none';
  const clearActive = currentState === 'Filter';
  const selectActive = currentState === 'Select';

  const searchOpacity = useDerivedValue(
    () =>
      withDelay(
        searchActive ? CROSSFADE_MS : 0,
        withTiming(searchActive ? 1 : 0, { duration: CROSSFADE_MS }),
      ),
    [searchActive],
  );
  const clearOpacity = useDerivedValue(
    () =>
      withDelay(
        clearActive ? CROSSFADE_MS : 0,
        withTiming(clearActive ? 1 : 0, { duration: CROSSFADE_MS }),
      ),
    [clearActive],
  );
  const selectOpacity = useDerivedValue(
    () =>
      withDelay(
        selectActive ? CROSSFADE_MS : 0,
        withTiming(selectActive ? 1 : 0, { duration: CROSSFADE_MS }),
      ),
    [selectActive],
  );

  const searchStyle = useAnimatedStyle(() => ({ opacity: searchOpacity.value }));
  const clearStyle = useAnimatedStyle(() => ({ opacity: clearOpacity.value }));
  const selectStyle = useAnimatedStyle(() => ({ opacity: selectOpacity.value }));

  return (
    <Animated.View style={tailwind.style('flex-1 h-6')}>
      <Animated.View
        style={[tailwind.style('absolute inset-0 flex-row items-center'), searchStyle]}
        pointerEvents={searchActive ? 'auto' : 'none'}>
        <Pressable onPress={onLeftIconPress} hitSlop={16}>
          <Icon size={24} icon={<SearchIcon stroke={tailwind.color('text-gray-800')} />} />
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[tailwind.style('absolute inset-0 flex-row items-center'), selectStyle]}
        pointerEvents={selectActive ? 'auto' : 'none'}>
        <Pressable onPress={onLeftIconPress} hitSlop={16}>
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
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[tailwind.style('absolute inset-0 flex-row items-center'), clearStyle]}
        pointerEvents={clearActive ? 'auto' : 'none'}>
        <Pressable onPress={onClearFilter} disabled={filtersAppliedCount === 0} {...handlers}>
          <Animated.View style={animatedStyle}>
            <Text
              style={tailwind.style(
                'text-md font-inter-medium-24 leading-[17px] tracking-[0.24px]',
                filtersAppliedCount === 0 ? 'text-gray-700' : 'text-blue-800',
              )}>
              {i18n.t('CONVERSATION.HEADER.CLEAR_FILTER')}
              {filtersAppliedCount > 0 ? ` (${filtersAppliedCount})` : ''}
            </Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const RightSection = ({
  currentState,
  filtersAppliedCount,
  onRightIconPress,
}: RightSectionProps) => {
  const { entering, exiting } = useHeaderAnimation();

  return (
    <Animated.View style={tailwind.style('flex-1 items-end')}>
      <Pressable onPress={onRightIconPress} hitSlop={16}>
        {currentState === 'Filter' || currentState === 'Select' ? (
          <Animated.View exiting={exiting} entering={entering}>
            <Icon size={24} icon={<CloseIcon />} />
          </Animated.View>
        ) : (
          <Animated.View exiting={exiting} entering={entering}>
            {filtersAppliedCount > 0 && (
              <Animated.View
                style={tailwind.style(
                  'absolute z-10 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-800',
                )}
              />
            )}
            <Icon size={24} icon={<FilterIcon />} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
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

  return (
    <Animated.View
      style={[tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]')]}>
      <LeftSlot
        currentState={currentState}
        isSelectedAll={isSelectedAll}
        filtersAppliedCount={filtersAppliedCount}
        onLeftIconPress={onLeftIconPress}
        onClearFilter={onClearFilter}
        handlers={handlers}
        animatedStyle={animatedStyle}
      />
      <HeaderTitle />
      <RightSection
        currentState={currentState}
        filtersAppliedCount={filtersAppliedCount}
        onRightIconPress={onRightIconPress}
      />
    </Animated.View>
  );
};
