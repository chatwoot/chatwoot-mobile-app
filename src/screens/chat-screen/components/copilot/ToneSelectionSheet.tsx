import React, { forwardRef, useCallback } from 'react';
import { Pressable, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop } from '@/components-next';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { COPILOT_ACTIONS } from '@/constants/copilot';
import type { CopilotActionKey } from '@/types/Copilot';
import i18n from '@/i18n';

const TONE_OPTIONS = [
  { key: COPILOT_ACTIONS.PROFESSIONAL, label: i18n.t('COPILOT.TONE_PROFESSIONAL') },
  { key: COPILOT_ACTIONS.FRIENDLY, label: i18n.t('COPILOT.TONE_FRIENDLY') },
  { key: COPILOT_ACTIONS.STRAIGHTFORWARD, label: i18n.t('COPILOT.TONE_STRAIGHTFORWARD') },
  { key: COPILOT_ACTIONS.CASUAL, label: i18n.t('COPILOT.TONE_CASUAL') },
  { key: COPILOT_ACTIONS.CONFIDENT, label: i18n.t('COPILOT.TONE_CONFIDENT') },
];

type ToneSelectionSheetProps = {
  onSelectTone: (tone: CopilotActionKey) => void;
};

export const ToneSelectionSheet = forwardRef<BottomSheetModal, ToneSelectionSheetProps>(
  ({ onSelectTone }, ref) => {
    const hapticSelection = useHaptic();

    const handleSelectTone = useCallback(
      (tone: CopilotActionKey) => {
        hapticSelection?.();
        onSelectTone(tone);
        if (ref && 'current' in ref && ref.current) {
          ref.current.dismiss();
        }
      },
      [hapticSelection, onSelectTone, ref],
    );

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-t-[26px] overflow-hidden')}
        enablePanDownToClose
        enableDynamicSizing>
        <BottomSheetView>
          <Animated.View style={tailwind.style('items-center pt-1 pb-4')}>
            <Text
              style={tailwind.style(
                'text-[15px] font-inter-580-24 leading-[17px] tracking-[0.3px] text-gray-700 text-center',
              )}>
              {i18n.t('COPILOT.SELECT_TONE')}
            </Text>
          </Animated.View>
          {TONE_OPTIONS.map(option => (
            <Pressable
              key={option.key}
              onPress={() => handleSelectTone(option.key as CopilotActionKey)}
              style={tailwind.style(
                'h-[60px] justify-center pl-4 pr-3 border-b border-slate-200',
              )}>
              <Text
                style={tailwind.style(
                  'text-base font-inter-normal-20 leading-[22px] tracking-[0.16px] text-gray-950',
                )}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
