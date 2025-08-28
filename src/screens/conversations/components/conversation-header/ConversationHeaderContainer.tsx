import React, { useEffect, useMemo } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { useConversationListStateContext } from '@/context';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { getFilteredConversations } from '@/store/conversation/conversationSelectors';
import { useThemedStyles } from '@/hooks';
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
  selectSelectedConversations,
} from '@/store/conversation/conversationSelectedSlice';
import { selectCurrentState, setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { ConversationFilterBar } from '../conversation-filters';
import { ConversationHeaderPresenter } from './ConversationHeaderPresenter';

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
  const currentState = useAppSelector(selectCurrentState);
  const themedTailwind = useThemedStyles();

  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);

  const { openedRowIndex } = useConversationListStateContext();

  const allConversations = useAppSelector(state =>
    getFilteredConversations(state, filters, userId),
  );

  const selectedConversations = useAppSelector(selectSelectedConversations);

  const isSelectedAll = useMemo(
    () => selectedConversations.length === allConversations.length,
    [selectedConversations, allConversations],
  );

  const hapticSuccess = useHaptic('success');

  const headerBorderColor = tailwind.color('text-blackA-A3') as string;

  const headerOpenState = useDerivedValue(() =>
    currentState !== 'none' && currentState !== 'Select' ? withSpring(1) : withSpring(0),
  );

  // This creates a subtle visual effect where the border fades away when the header is in an active state (Search/Filter) and reappears when returning to the default state.
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

  const filtersAppliedCount = useMemo(
    () => getFiltersAppliedCount(defaultFilterState, filters),
    [filters],
  );

  const handleClearFilter = () => {
    hapticSuccess?.();
    dispatch(resetFilters());
  };

  return (
    <Animated.View style={[themedTailwind.style('border-b-[1px] bg-white'), headerBorderAnimation]}>
      <ConversationHeaderPresenter
        currentState={currentState}
        isSelectedAll={isSelectedAll}
        filtersAppliedCount={filtersAppliedCount}
        onLeftIconPress={handleLeftIconPress}
        onRightIconPress={handleRightIconPress}
        onClearFilter={handleClearFilter}
      />
      {currentState === 'Filter' ? <ConversationFilterBar /> : null}
    </Animated.View>
  );
};
