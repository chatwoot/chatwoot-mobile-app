import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator } from 'react-native';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';

import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import i18n from '@/i18n';
import { tailwind } from '@/theme';
import type { ContactableInbox } from '@/store/contact/contactTypes';
import { InboxListRow } from './components/InboxListRow';

type ContactableInboxSelectorSheetProps = {
  visible: boolean;
  inboxes: ContactableInbox[];
  isLoading?: boolean;
  onSelect: (inbox: ContactableInbox) => void;
  onClose: () => void;
};

export const ContactableInboxSelectorSheet = ({
  visible,
  inboxes,
  isLoading = false,
  onSelect,
  onClose,
}: ContactableInboxSelectorSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const sortedInboxes = useMemo(
    () => [...inboxes].sort((current, next) => current.name.localeCompare(next.name)),
    [inboxes],
  );

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss({ overshootClamping: true });
    }
  }, [visible]);

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
      snapPoints={['46%']}>
      <BottomSheetWrapper>
        <Animated.View style={tailwind.style('px-4 pt-2 pb-6')}>
          <Animated.Text style={tailwind.style('text-base font-inter-580-24 text-gray-950 pb-3')}>
            {i18n.t('CONTACT_DETAILS.CHOOSE_INBOX')}
          </Animated.Text>
          {isLoading ? (
            <Animated.View style={tailwind.style('items-center justify-center py-10')}>
              <ActivityIndicator />
            </Animated.View>
          ) : null}
          {!isLoading && !sortedInboxes.length ? (
            <Animated.View style={tailwind.style('rounded-xl border border-gray-100 p-4')}>
              <Animated.Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-950')}>
                {i18n.t('CONTACT_DETAILS.NO_CONTACTABLE_INBOXES')}
              </Animated.Text>
              <Animated.Text style={tailwind.style('pt-1 text-xs font-inter-420-20 text-gray-700')}>
                {i18n.t('CONTACT_DETAILS.NO_CONTACTABLE_INBOXES_HINT')}
              </Animated.Text>
            </Animated.View>
          ) : null}
          {!isLoading &&
            sortedInboxes.map(inbox => (
              <InboxListRow
                key={`${inbox.id}-${inbox.sourceId}`}
                inbox={inbox}
                subtitle={
                  inbox.phoneNumber || inbox.email || inbox.channelType.replace('Channel::', '')
                }
                card
                onPress={onSelect}
              />
            ))}
        </Animated.View>
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
};
