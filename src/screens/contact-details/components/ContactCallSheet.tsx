import React, { forwardRef } from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetHeader } from '@/components-next';
import { Sheet, type SheetRef } from '@/components-next/common/sheet/Sheet';
import { HandsetIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import i18n from '@/i18n';

import type { ContactCallOption } from '../utils/contactCallOptions';

type CallOptionCellProps = {
  option: ContactCallOption;
  isLastItem: boolean;
  onSelect: (option: ContactCallOption) => void;
};

const CallOptionCell = ({ option, isLastItem, onSelect }: CallOptionCellProps) => {
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    onSelect(option);
  };

  const isInbox = option.type === 'inbox';
  const title = isInbox ? option.inbox.name : i18n.t('CONTACT_DETAILS.PHONE_DIALER');
  const detail = isInbox ? option.inbox.phoneNumber : '';

  return (
    <Pressable onPress={handlePress} style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row items-center py-[11px] pr-3',
          !isLastItem ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <HandsetIcon color={tailwind.color('bg-gray-950') ?? ''} size={18} />
        <Animated.Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={tailwind.style(
            'flex-1 min-w-0 ml-2 text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
          )}>
          {title}
        </Animated.Text>
        {detail ? (
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'shrink-0 ml-3 text-sm text-gray-900 font-inter-420-20 leading-[18px] tracking-[0.16px]',
            )}>
            {detail}
          </Animated.Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

type ContactCallSheetProps = {
  options: ContactCallOption[];
  onSelect: (option: ContactCallOption) => void;
  onDismiss: () => void;
};

const MAX_ROWS_WITHOUT_SCROLL = 6;

export const ContactCallSheet = forwardRef<SheetRef, ContactCallSheetProps>(
  ({ options, onSelect, onDismiss }, ref) => {
    const { bottom } = useSafeAreaInsets();
    const scrolls = options.length > MAX_ROWS_WITHOUT_SCROLL;

    const rows = options.map((option, index) => (
      <CallOptionCell
        key={option.type === 'inbox' ? option.inbox.id : 'dialer'}
        option={option}
        isLastItem={index === options.length - 1}
        onSelect={onSelect}
      />
    ));

    return (
      <Sheet
        ref={ref}
        {...(scrolls ? { detents: [0.6], scrollable: true } : { autoSize: true })}
        onDismiss={onDismiss}>
        <BottomSheetHeader headerText={i18n.t('CONTACT_DETAILS.CALL_OPTIONS_TITLE')} />
        {scrolls ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tailwind.style('pt-3 pl-3', `pb-[${24 + bottom}px]`)}>
            {rows}
          </ScrollView>
        ) : (
          <Animated.View style={tailwind.style('pt-3 pb-6 pl-3')}>{rows}</Animated.View>
        )}
      </Sheet>
    );
  },
);

ContactCallSheet.displayName = 'ContactCallSheet';
