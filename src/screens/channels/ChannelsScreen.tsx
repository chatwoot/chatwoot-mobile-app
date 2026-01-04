import React, { useCallback, useMemo } from 'react';
import { Pressable, StatusBar } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';

import { TAB_BAR_HEIGHT } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import {
  defaultFilterState,
  setFiltersState,
} from '@/store/conversation/conversationFilterSlice';
import { Icon } from '@/components-next';
import { tailwind } from '@/theme';
import { useHaptic, getChannelIcon } from '@/utils';
import { Channel } from '@/types';
import i18n from '@/i18n';
import { EmptyStateIcon } from '@/svg-icons';

const ChannelsHeader = () => {
  return (
    <Animated.View style={tailwind.style('border-b-[1px] border-b-blackA-A3')}>
      <Animated.View
        style={tailwind.style('flex flex-row justify-center items-center px-4 pt-2 pb-[12px]')}>
        <Animated.Text
          style={tailwind.style(
            'text-[17px] text-center leading-[17px] tracking-[0.32px] font-inter-medium-24 text-gray-950',
          )}>
          {i18n.t('CHANNELS.TITLE')}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

type ChannelItem = {
  id: number;
  name: string;
  channelType: Channel;
  medium: string;
};

type ChannelRowProps = {
  item: ChannelItem;
  isLastItem: boolean;
  onPress: (id: number) => void;
};

const ChannelRow = ({ item, isLastItem, onPress }: ChannelRowProps) => {
  return (
    <Pressable onPress={() => onPress(item.id)}>
      <Animated.View
        style={tailwind.style(
          'flex flex-row items-center px-4 py-[11px]',
          !isLastItem ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Icon
          icon={getChannelIcon(item.channelType, item.medium, '')}
          size={18}
          style={tailwind.style('my-auto flex items-center justify-center')}
        />
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize ml-2',
          )}>
          {item.name}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const ChannelsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const hapticSelection = useHaptic();

  const inboxes = useAppSelector(selectAllInboxes);

  const channels = useMemo(
    () =>
      inboxes.map(inbox => ({
        id: inbox.id,
        name: inbox.name,
        channelType: inbox.channelType as Channel,
        medium: inbox.medium,
      })),
    [inboxes],
  );

  const handleChannelPress = useCallback(
    (inboxId: number) => {
      hapticSelection?.();
      dispatch(
        setFiltersState({
          ...defaultFilterState,
          inbox_id: inboxId.toString(),
        }),
      );
      navigation.navigate('Conversations');
    },
    [dispatch, hapticSelection, navigation],
  );

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <ChannelsHeader />
      {channels.length === 0 ? (
        <Animated.View
          style={tailwind.style(
            'flex-1 items-center justify-center',
            `pb-[${TAB_BAR_HEIGHT}px]`,
          )}>
          <EmptyStateIcon />
          <Animated.Text style={tailwind.style('pt-6 text-md tracking-[0.32px] text-gray-800')}>
            {i18n.t('CHANNELS.EMPTY')}
          </Animated.Text>
        </Animated.View>
      ) : (
        <FlashList
          data={channels}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item, index }) => (
            <ChannelRow
              item={item}
              isLastItem={index === channels.length - 1}
              onPress={handleChannelPress}
            />
          )}
          estimatedItemSize={56}
          contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
        />
      )}
    </SafeAreaView>
  );
};

export default ChannelsScreen;
