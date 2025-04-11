import React, { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { BottomSheetBackdrop } from '@/components-next';
import i18n from '@/i18n';
import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { Macro } from '@/types';
import { useAppSelector } from '@/hooks';
import { selectAllMacros } from '@/store/macro/macroSelectors';

import MacroStack from './MacroStack';
import MacroDetails from './MacroDetails';
import { MacroProvider } from './MacroContext';

export const MacrosList = ({ conversationId }: { conversationId: number }) => {
  const macros = useAppSelector(selectAllMacros);
  const [selectedMacro, setSelectedMacro] = useState<Macro | null>(null);

  const handleMacroPress = (macro: Macro) => {
    setSelectedMacro(macro);
  };

  const handleBack = () => {
    setSelectedMacro(null);
  };

  const onClose = () => {
    setSelectedMacro(null);
    macrosListSheetRef.current?.dismiss({ overshootClamping: true });
  };

  const { macrosListSheetRef } = useRefsContext();

  return (
    <Animated.View>
      <BottomSheetModal
        ref={macrosListSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-t-[26px] overflow-hidden')}
        enablePanDownToClose
        snapPoints={['75%']}
        enableDynamicSizing={false}>
        <MacroProvider conversationId={conversationId} onClose={onClose}>
          <Animated.View style={tailwind.style('flex-1')}>
            {selectedMacro ? (
              <MacroDetails macro={selectedMacro} onBack={handleBack} onClose={onClose} />
            ) : (
              <Animated.View style={tailwind.style('flex-1')}>
                <View style={tailwind.style('px-4 pt-1 pb-4 items-center')}>
                  <Animated.Text
                    style={tailwind.style(
                      'text-gray-700 font-inter-580-24 leading-[17px] tracking-[0.32px]',
                    )}>
                    {i18n.t('MACRO.SELECT_MACRO')}
                  </Animated.Text>
                </View>
                <BottomSheetScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={tailwind.style('px-3 pb-6')}>
                  <MacroStack
                    handleMacroPress={handleMacroPress}
                    macrosList={macros}
                    isInsideBottomSheet
                  />
                </BottomSheetScrollView>
              </Animated.View>
            )}
          </Animated.View>
        </MacroProvider>
      </BottomSheetModal>
    </Animated.View>
  );
};

export default MacrosList;
