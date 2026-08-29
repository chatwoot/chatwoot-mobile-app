import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sheet } from '@/components-next/common/sheet/Sheet';
import i18n from '@/i18n';
import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { Macro } from '@/types';
import { useAppSelector } from '@/hooks';
import { selectAllMacros } from '@/store/macro/macroSelectors';

import MacroStack from './MacroStack';
import MacroDetails from './MacroDetails';
import { MacroProvider } from './MacroContext';

const LIST_BOTTOM_PADDING = 24;

export const MacrosList = ({ conversationId }: { conversationId: number }) => {
  const { bottom } = useSafeAreaInsets();
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
    macrosListSheetRef.current?.dismiss();
  };

  const { macrosListSheetRef } = useRefsContext();

  return (
    <Animated.View>
      <Sheet ref={macrosListSheetRef} detents={[0.75]} scrollable>
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
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  // The sheet reaches the screen edge, so the last row needs to clear the home indicator.
                  contentContainerStyle={tailwind.style(
                    'px-3',
                    `pb-[${LIST_BOTTOM_PADDING + bottom}px]`,
                  )}>
                  <MacroStack
                    handleMacroPress={handleMacroPress}
                    macrosList={macros}
                    isInsideBottomSheet
                  />
                </ScrollView>
              </Animated.View>
            )}
          </Animated.View>
        </MacroProvider>
      </Sheet>
    </Animated.View>
  );
};

export default MacrosList;
