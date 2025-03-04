import React from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Macro } from '@/types';
import MacroItem from './MacroItem';

type MacroStackProps = {
  macrosList: Macro[];
  isInsideBottomSheet?: boolean;
  handleMacroPress: (macro: Macro) => void;
};

const MacroStack = (props: MacroStackProps) => {
  const { macrosList, handleMacroPress, isInsideBottomSheet = false } = props;

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
