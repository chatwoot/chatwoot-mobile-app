import React, { useEffect, useMemo } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { StackActions, useNavigation } from '@react-navigation/native';

import { FilterBar, Icon } from '@/components-next/common';
import { useConversationListStateContext } from '@/context';
import { CheckedIcon, CloseIcon, FilterIcon, SearchIcon, UncheckedIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import { getFilteredConversations } from '@/store/conversation/conversationSelectors';
import { selectUserId } from '@/store/auth/authSelectors';
import {
  resetFilters,
  selectFilters,
  defaultFilterState,
  FilterState,
} from '@/store/conversation/conversationFilterSlice';
import {
  clearSelection,
  selectAll,
  selectSelectedIds,
} from '@/store/conversation/conversationSelectedSlice';
import { selectCurrentState, setCurrentState } from '@/store/conversation/conversationHeaderSlice';

import { useAppDispatch, useAppSelector } from '@/hooks';

const getFiltersAppliedCount = (defaultState: FilterState, updatedState: FilterState): number => {
  let count = 0;
  for (const objKey in defaultState) {
    const key = objKey as keyof FilterState;
    if (defaultState[key] !== updatedState[key]) {
      count++;
    }
  }
  return count;
};

export const ConversationHeader = () => {
  const navigation = useNavigation();
  const currentState = useAppSelector(selectCurrentState);

  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);

  const { openedRowIndex } = useConversationListStateContext();
  const selectedIds = useAppSelector(selectSelectedIds);

  const allConversations = useAppSelector(state =>
    getFilteredConversations(state, filters, userId),
  );

  const isSelectedAll = useMemo(
    () => selectedIds.length === allConversations.length,
    [selectedIds, allConversations],
  );

  const hapticSuccess = useHaptic('success');

  const headerBorderColor = tailwind.color('text-blackA-A3') as string;
  const { handlers, animatedStyle } = useScaleAnimation();
  const headerOpenState = useDerivedValue(() =>
    currentState !== 'none' && currentState !== 'Select' ? withSpring(1) : withSpring(0),
  );

  const headerBorderAnimation = useAnimatedStyle(() => {
    return {
      borderBottomColor: interpolateColor(
        headerOpenState.value,
        [0, 1],
        [headerBorderColor, 'transparent'],
      ),
    };
  }, []);

  useEffect(() => {
    if (currentState !== 'none') {
      openedRowIndex.value = -1;
    }
  }, [currentState, openedRowIndex]);

  const handleLeftIconPress = () => {
    if (currentState === 'Search') {
      dispatch(setCurrentState('none'));
    } else if (currentState === 'Select') {
      if (isSelectedAll) {
        dispatch(clearSelection());
      } else {
        dispatch(selectAll(allConversations));
      }
    } else {
      dispatch(setCurrentState('Search'));
    }
  };

  const handleRightIconPress = () => {
    if (currentState === 'Filter') {
      dispatch(setCurrentState('none'));
    } else if (currentState === 'Select') {
      dispatch(clearSelection());
      dispatch(setCurrentState('none'));
    } else {
      dispatch(setCurrentState('Filter'));
    }
  };

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

  const filtersAppliedCount = useMemo(
    () => getFiltersAppliedCount(defaultFilterState, filters),
    [filters],
  );

  const handleClearFilter = () => {
    hapticSuccess?.();
    dispatch(resetFilters());
  };

  const openSearch = () => {
    const navigateToScreen = StackActions.push('SearchScreen');
    navigation.dispatch(navigateToScreen);
  };

  return (
    <Animated.View style={[tailwind.style('border-b-[1px]'), headerBorderAnimation]}>
      <Animated.View
        style={[tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]')]}>
        {currentState !== 'Filter' && currentState !== 'Search' ? (
          currentState === 'Select' ? (
            <Animated.View style={tailwind.style('flex-1 items-start')}>
              <Pressable onPress={handleLeftIconPress} hitSlop={16}>
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
              <Pressable onPress={openSearch} hitSlop={16}>
                <Animated.View exiting={exiting} entering={entering}>
                  <Icon size={24} icon={<SearchIcon />} />
                </Animated.View>
              </Pressable>
            </Animated.View>
          )
        ) : null}
        {currentState === 'Filter' ? (
          <Animated.View
            style={[tailwind.style('flex-1'), animatedStyle]}
            exiting={exiting}
            entering={entering}>
            <Pressable
              onPress={handleClearFilter}
              disabled={filtersAppliedCount === 0}
              {...handlers}>
              <Text
                style={tailwind.style(
                  'text-md font-inter-medium-24 leading-[17px] tracking-[0.24px]',
                  filtersAppliedCount === 0 ? 'text-gray-700' : 'text-blue-800',
                )}>
                Clear
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
            Conversations
          </Text>
        </Animated.View>
        <Animated.View style={tailwind.style('flex-1 items-end')}>
          <Pressable onPress={handleRightIconPress} hitSlop={16}>
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
      {currentState === 'Filter' ? <FilterBar /> : null}
    </Animated.View>
  );
};
