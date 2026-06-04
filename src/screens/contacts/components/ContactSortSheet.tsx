import React, { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';

import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { BottomSheetHeader, Icon } from '@/components-next/common';
import i18n from '@/i18n';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

export type ContactSortMode = 'newest' | 'oldest';

const sortOptions: { value: ContactSortMode; labelKey: string }[] = [
  { value: 'newest', labelKey: 'CONTACTS.SORT.NEWEST' },
  { value: 'oldest', labelKey: 'CONTACTS.SORT.OLDEST' },
];

type ContactSortSheetProps = {
  visible: boolean;
  selectedSort: ContactSortMode;
  onClose: () => void;
  onSelect: (sortMode: ContactSortMode) => void;
};

export const ContactSortSheet = ({
  visible,
  selectedSort,
  onClose,
  onSelect,
}: ContactSortSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss({ overshootClamping: true });
    }
  }, [visible]);

  const handleSelect = (sortMode: ContactSortMode) => {
    onSelect(sortMode);
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
      snapPoints={['26%']}>
      <BottomSheetWrapper>
        <BottomSheetHeader headerText={i18n.t('CONTACTS.SORT.TITLE')} />
        <View style={tailwind.style('px-4 pt-2')}>
          {sortOptions.map((option, index) => {
            const isSelected = option.value === selectedSort;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => handleSelect(option.value)}
                style={({ pressed }) =>
                  tailwind.style(
                    'flex-row items-center justify-between py-4',
                    index !== sortOptions.length - 1 ? 'border-b border-blackA-A3' : '',
                    pressed ? 'bg-gray-50' : '',
                  )
                }>
                <Animated.Text style={tailwind.style('text-base font-inter-420-20 text-gray-950')}>
                  {i18n.t(option.labelKey)}
                </Animated.Text>
                {isSelected ? <Icon icon={<TickIcon />} size={20} /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
};
