import React, { useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { useConversationListStateContext, useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
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
  selectSelectedConversations,
} from '@/store/conversation/conversationSelectedSlice';
import {
  selectCurrentState,
  setBottomSheetState,
  setCurrentState,
} from '@/store/conversation/conversationHeaderSlice';
import { notificationActions } from '@/store/notification/notificationAction';
import { ConversationFilterBar } from '../conversation-filters';
import { ConversationHeaderPresenter } from './ConversationHeaderPresenter';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import i18n from '@/i18n';
import { getInboxFilterIds } from '@/utils/conversationUtils';
import { Icon } from '@/components-next/common';
import { SearchIcon } from '@/svg-icons';

const ChannelSearchButton = ({ onPress }: { onPress: () => void }) => (
  <View style={tailwind.style('px-4 pb-1')}>
    <Pressable
      accessibilityRole="search"
      onPress={onPress}
      style={({ pressed }) =>
        tailwind.style(
          'h-10 flex-row items-center rounded-[13px] border border-gray-100 bg-gray-50 px-3',
          pressed ? 'bg-gray-100' : '',
        )
      }>
      <Icon icon={<SearchIcon />} size={20} />
      <Animated.Text
        style={tailwind.style('ml-2 text-base font-inter-normal-20 leading-[22px] text-gray-700')}>
        {i18n.t('CHANNELS.SEARCH_CONVERSATIONS_PLACEHOLDER')}
      </Animated.Text>
    </Pressable>
  </View>
);

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

type ConversationHeaderProps = {
  showFilters?: boolean;
};

export const ConversationHeader = ({ showFilters = false }: ConversationHeaderProps) => {
  const currentState = useAppSelector(selectCurrentState);

  const filters = useAppSelector(selectFilters);
  const inboxes = useAppSelector(selectAllInboxes);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const navigation = useNavigation();
  const { filtersModalSheetRef } = useRefsContext();

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
    if (currentState === 'Select') {
      if (isSelectedAll) {
        dispatch(clearSelection());
      } else {
        dispatch(selectAll(allConversations));
      }
    } else if (showFilters) {
      dispatch(notificationActions.markAllAsRead());
    } else {
      // Navigate to search screen
      const pushToSearchScreen = StackActions.push('SearchScreen');
      navigation.dispatch(pushToSearchScreen);
    }
  };

  const handleRightIconPress = () => {
    if (currentState === 'Filter') {
      dispatch(setCurrentState('none'));
    } else if (currentState === 'Select') {
      dispatch(clearSelection());
      dispatch(setCurrentState('none'));
    } else if (showFilters) {
      filtersModalSheetRef.current?.present();
      dispatch(setBottomSheetState('sort_by'));
    } else {
      dispatch(setCurrentState('Filter'));
    }
  };

  const filtersAppliedCount = useMemo(
    () => getFiltersAppliedCount(defaultFilterState, filters),
    [filters],
  );

  const headerTitle = useMemo(() => {
    const selectedInboxIds = getInboxFilterIds(filters.inbox_id);
    if (selectedInboxIds.length > 1) {
      return i18n.t('CHANNELS.SELECTED_COUNT', { count: selectedInboxIds.length });
    }

    const selectedInbox = inboxes.find(inbox => inbox.id === selectedInboxIds[0]);
    return selectedInbox?.name || i18n.t('CONVERSATION.HEADER.TITLE');
  }, [filters.inbox_id, inboxes]);

  const handleClearFilter = () => {
    hapticSuccess?.();
    dispatch(resetFilters());
  };

  const openSearchScreen = () => {
    navigation.dispatch(StackActions.push('SearchScreen'));
  };

  return (
    <Animated.View style={[tailwind.style('border-b-[1px]'), headerBorderAnimation]}>
      <ConversationHeaderPresenter
        currentState={currentState}
        isSelectedAll={isSelectedAll}
        filtersAppliedCount={filtersAppliedCount}
        isChannelView={showFilters}
        title={headerTitle}
        onLeftIconPress={handleLeftIconPress}
        onRightIconPress={handleRightIconPress}
        onClearFilter={handleClearFilter}
      />
      {showFilters ? <ChannelSearchButton onPress={openSearchScreen} /> : null}
      {currentState === 'Filter' || showFilters ? (
        <ConversationFilterBar prioritizeInbox={showFilters} />
      ) : null}
    </Animated.View>
  );
};
