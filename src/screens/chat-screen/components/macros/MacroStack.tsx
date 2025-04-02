import React from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Macro } from '@/types';
import MacroItem from './MacroItem';
import i18n from '@/i18n';

type MacroStackProps = {
  macrosList: Macro[];
  isInsideBottomSheet?: boolean;
  handleMacroPress: (macro: Macro) => void;
};

const MacroStack = (props: MacroStackProps) => {
  const { macrosList, handleMacroPress, isInsideBottomSheet = false } = props;

  if (macrosList.length === 0) {
    return (
      <Animated.View
        style={tailwind.style(
          isInsideBottomSheet ? 'py-1' : '',
          'flex-1 items-center justify-center',
        )}>
        <Animated.Text style={tailwind.style('pt-6 text-md  tracking-[0.32px] text-gray-800')}>
          {i18n.t('MACRO.NO_MACROS')}
        </Animated.Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={tailwind.style(isInsideBottomSheet ? 'py-1' : '')}>
      {macrosList.map((macro, index) => (
        <MacroItem
          handleMacroPress={handleMacroPress}
          key={index}
          {...{ index, macro, isInsideBottomSheet }}
          isLastItem={isInsideBottomSheet ? macrosList.length - 1 === index : false}
        />
      ))}
    </Animated.View>
  );
};

export default MacroStack;
