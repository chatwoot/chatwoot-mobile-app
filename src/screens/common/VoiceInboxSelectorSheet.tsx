import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';

import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { BottomSheetHeader, Icon } from '@/components-next/common';
import i18n from '@/i18n';
import { SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Inbox } from '@/types/Inbox';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';
import { sortInboxesByName } from '@/utils/inboxSortUtils';
import { InboxListRow } from './components/InboxListRow';

const getInboxSearchText = (inbox: Inbox) =>
  [
    inbox.name,
    inbox.phoneNumber,
    inbox.channelType.replace('Channel::', ''),
    inbox.provider,
    inbox.medium,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

type VoiceInboxSelectorSheetProps = {
  visible: boolean;
  inboxes: Inbox[];
  selectedInboxId?: number;
  onSelect: (inbox: Inbox) => void;
  onClose: () => void;
};

export const VoiceInboxSelectorSheet = ({
  visible,
  inboxes,
  selectedInboxId,
  onSelect,
  onClose,
}: VoiceInboxSelectorSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const voiceInboxes = useMemo(
    () => sortInboxesByName(inboxes.filter(isVoiceCallEnabled)),
    [inboxes],
  );

  const filteredVoiceInboxes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return voiceInboxes;
    }

    return voiceInboxes.filter(inbox => getInboxSearchText(inbox).includes(normalizedQuery));
  }, [searchQuery, voiceInboxes]);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss({ overshootClamping: true });
    }
  }, [visible]);

  const handleSelect = (inbox: Inbox) => {
    onSelect(inbox);
    onClose();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      backdropComponent={BottomSheetBackdrop}
      handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
      enablePanDownToClose
      onDismiss={onClose}
      animationConfigs={animationConfigs}
      handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
      style={tailwind.style('rounded-[26px] overflow-hidden')}
      snapPoints={['70%']}>
      <BottomSheetWrapper>
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
            <Animated.Text
              style={tailwind.style('pt-3 text-sm font-inter-medium-24 text-gray-700')}>
              {i18n.t('DIAL.VOICE_INBOXES')}
            </Animated.Text>
          </View>
          {!voiceInboxes.length && (
            <Animated.View style={tailwind.style('mx-4 rounded-xl border border-gray-100 p-4')}>
              <Animated.Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-950')}>
                {i18n.t('DIAL.NO_VOICE_INBOXES')}
              </Animated.Text>
              <Animated.Text style={tailwind.style('pt-1 text-xs font-inter-420-20 text-gray-700')}>
                {i18n.t('DIAL.NO_VOICE_INBOXES_HINT')}
              </Animated.Text>
            </Animated.View>
          )}
          {!!voiceInboxes.length && !filteredVoiceInboxes.length && (
            <Animated.View style={tailwind.style('items-center justify-center pt-16 px-8')}>
              <Animated.Text
                style={tailwind.style('text-sm font-inter-420-20 text-gray-700 text-center')}>
                {i18n.t('CHANNELS.EMPTY')}
              </Animated.Text>
            </Animated.View>
          )}
          {filteredVoiceInboxes.map((inbox, index) => {
            const isSelected = inbox.id === selectedInboxId;
            return (
              <InboxListRow
                key={inbox.id}
                inbox={inbox}
                subtitle={inbox.phoneNumber}
                isSelected={isSelected}
                showDivider={index !== filteredVoiceInboxes.length - 1}
                onPress={handleSelect}
              />
            );
          })}
        </Animated.ScrollView>
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
};
