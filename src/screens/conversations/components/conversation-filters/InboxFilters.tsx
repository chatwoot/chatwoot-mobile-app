import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { SearchIcon, TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next/common';
import { selectFilters, setFilters } from '@/store/conversation/conversationFilterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { getChannelIcon } from '@/utils';
import i18n from '@/i18n';
import { sortInboxesByName } from '@/utils/inboxSortUtils';
import type { Inbox } from '@/types/Inbox';
import { getInboxFilterIds } from '@/utils/conversationUtils';

type InboxCellProps = {
  value: Inbox;
  isLastItem: boolean;
  isSelected: boolean;
  onToggle: (id: number) => void;
};

const InboxCell = (props: InboxCellProps) => {
  const { value, isLastItem, isSelected, onToggle } = props;
  const hapticSelection = useHaptic();

  const handlePreferredAssigneeTypePress = () => {
    hapticSelection?.();
    onToggle(value.id);
  };

  return (
    <Pressable
      onPress={handlePreferredAssigneeTypePress}
      style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !isLastItem ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.View style={tailwind.style('flex-row items-center')}>
          <Icon
            icon={getChannelIcon(
              value.channelType,
              value.medium,
              value.additionalAttributes?.type || value.provider || '',
              value.medium,
            )}
            size={18}
            style={tailwind.style('my-auto flex items-center justify-center')}
          />

          <Animated.Text
            style={tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize ml-2',
            )}>
            {value.name}
          </Animated.Text>
        </Animated.View>
        {isSelected ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

type InboxStackProps = {
  list: Inbox[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};

const InboxStack = (props: InboxStackProps) => {
  const { list, selectedIds, onToggle } = props;
  return (
    <Animated.ScrollView
      style={tailwind.style('pl-3 pb-4')}
      bounces={false}
      showsVerticalScrollIndicator={true}
      scrollEventThrottle={16}
      nestedScrollEnabled={true}>
      {list.map((value, index) => (
        <InboxCell
          key={value.id}
          value={value}
          isLastItem={index === list.length - 1}
          isSelected={selectedIds.includes(value.id)}
          onToggle={onToggle}
        />
      ))}
    </Animated.ScrollView>
  );
};

const getInboxSearchText = (inbox: Inbox) =>
  [inbox.name, inbox.channelType.replace('Channel::', ''), inbox.provider, inbox.medium]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export const InboxFilters = () => {
  const { filtersModalSheetRef } = useRefsContext();
  const dispatch = useAppDispatch();
  const inboxes = useAppSelector(selectAllInboxes);
  const filters = useAppSelector(selectFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>(getInboxFilterIds(filters.inbox_id));

  useEffect(() => {
    setSelectedIds(getInboxFilterIds(filters.inbox_id));
  }, [filters.inbox_id]);

  const inboxList = useMemo(() => {
    const sortedInboxes = sortInboxesByName(inboxes);
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortedInboxes;
    }

    return sortedInboxes.filter(inbox => getInboxSearchText(inbox).includes(normalizedQuery));
  }, [inboxes, searchQuery]);

  const toggleInbox = (id: number) => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(selectedId => selectedId !== id) : [...current, id],
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const applySelection = () => {
    dispatch(
      setFilters({
        key: 'inbox_id',
        value: selectedIds.length ? [...selectedIds].sort((a, b) => a - b).join(',') : '0',
      }),
    );
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Animated.ScrollView
      bounces={false}
      showsVerticalScrollIndicator={true}
      scrollEventThrottle={16}
      nestedScrollEnabled={true}>
      <BottomSheetHeader headerText={i18n.t('CONVERSATION.FILTERS.INBOX.TITLE')} />
      <View style={tailwind.style('px-4 pt-2 pb-3')}>
        <View
          style={tailwind.style(
            'h-10 flex-row items-center rounded-[13px] border border-gray-100 bg-gray-50 px-3',
          )}>
          <Icon icon={<SearchIcon />} size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={i18n.t('CHANNELS.SEARCH_PLACEHOLDER')}
            placeholderTextColor={tailwind.color('text-gray-700')}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            style={tailwind.style(
              'ml-2 flex-1 text-base font-inter-normal-20 leading-[22px] text-gray-950',
            )}
          />
        </View>
        <View style={tailwind.style('flex-row justify-between items-center pt-3')}>
          <Pressable onPress={clearSelection} hitSlop={12}>
            <Animated.Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-700')}>
              {i18n.t('FILTER.ALL_INBOXES')}
            </Animated.Text>
          </Pressable>
          <Pressable onPress={applySelection} hitSlop={12}>
            <Animated.Text style={tailwind.style('text-sm font-inter-medium-24 text-blue-800')}>
              {i18n.t('CHANNELS.APPLY_SELECTION')}
            </Animated.Text>
          </Pressable>
        </View>
      </View>
      <InboxStack list={inboxList} selectedIds={selectedIds} onToggle={toggleInbox} />
    </Animated.ScrollView>
  );
};
