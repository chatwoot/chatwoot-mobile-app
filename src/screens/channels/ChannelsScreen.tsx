import React, { useMemo, useState } from 'react';
import { Pressable, StatusBar, TextInput, View } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components-next/common';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { setFilters } from '@/store/conversation/conversationFilterSlice';
import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Inbox } from '@/types/Inbox';
import { getChannelIcon } from '@/utils';
import { sortInboxesByName } from '@/utils/inboxSortUtils';

const getChannelSearchText = (inbox: Inbox) =>
  [inbox.name, inbox.channelType.replace('Channel::', ''), inbox.provider, inbox.medium]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const ChannelRow = ({ inbox, onPress }: { inbox: Inbox; onPress: (inbox: Inbox) => void }) => (
  <Pressable
    accessibilityRole="button"
    onPress={() => onPress(inbox)}
    style={({ pressed }) =>
      tailwind.style(
        'flex-row items-center px-4 py-3 border-b border-blackA-A3',
        pressed ? 'bg-gray-50' : '',
      )
    }>
    <View style={tailwind.style('h-10 w-10 rounded-full bg-gray-50 items-center justify-center')}>
      <Icon
        icon={getChannelIcon(
          inbox.channelType,
          inbox.medium,
          inbox.additionalAttributes?.type || inbox.provider || '',
          inbox.medium,
        )}
        size={22}
      />
    </View>
    <View style={tailwind.style('ml-3 flex-1')}>
      <Animated.Text
        numberOfLines={1}
        style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
        {inbox.name}
      </Animated.Text>
      <Animated.Text
        numberOfLines={1}
        style={tailwind.style('pt-1 text-sm font-inter-420-20 text-gray-700')}>
        {inbox.channelType.replace('Channel::', '')}
      </Animated.Text>
    </View>
  </Pressable>
);

const ChannelsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const inboxes = useAppSelector(selectAllInboxes);
  const [searchQuery, setSearchQuery] = useState('');
  const sortedInboxes = useMemo(() => sortInboxesByName(inboxes), [inboxes]);
  const filteredInboxes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortedInboxes;
    }

    return sortedInboxes.filter(inbox => getChannelSearchText(inbox).includes(normalizedQuery));
  }, [searchQuery, sortedInboxes]);

  const openChannel = (inbox: Inbox) => {
    dispatch(setFilters({ key: 'inbox_id', value: inbox.id.toString() }));
    dispatch(setFilters({ key: 'assignee_type', value: 'me' }));
    dispatch(setFilters({ key: 'status', value: 'open' }));
    dispatch(setCurrentState('Filter'));
    navigation.dispatch(StackActions.push('ConversationScreen', { showFilters: true }));
  };

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <View style={tailwind.style('px-4 pt-3 pb-4')}>
        <Animated.Text
          style={tailwind.style(
            'text-[28px] font-inter-580-24 leading-[34px] tracking-[0.16px] text-gray-950',
          )}>
          {i18n.t('CHANNELS.TITLE')}
        </Animated.Text>
        <View
          style={tailwind.style(
            'mt-4 h-10 flex-row items-center rounded-[13px] border border-gray-100 bg-gray-50 px-3',
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
      </View>
      <Animated.ScrollView
        contentContainerStyle={tailwind.style('pb-28')}
        showsVerticalScrollIndicator={false}>
        {filteredInboxes.map(inbox => (
          <ChannelRow key={inbox.id} inbox={inbox} onPress={openChannel} />
        ))}
        {!filteredInboxes.length && (
          <View style={tailwind.style('items-center justify-center pt-20 px-8')}>
            <Animated.Text
              style={tailwind.style('text-sm font-inter-420-20 text-gray-700 text-center')}>
              {i18n.t('CHANNELS.EMPTY')}
            </Animated.Text>
          </View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default ChannelsScreen;
