import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, Spinner } from '@/components-next';
import { CaretRight, InfoIcon, MacroIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Macro } from '@/types';
import { useMacroContext } from './MacroContext';

type MacroItemProps = {
  macro: Macro;
  index: number;
  handleMacroPress: (macro: Macro) => void;
  isInsideBottomSheet: boolean;
  isLastItem: boolean;
};

const MacroItem = (props: MacroItemProps) => {
  const { macro, index, handleMacroPress, isInsideBottomSheet, isLastItem } = props;
  const { executeMacro, executingMacroId } = useMacroContext();

  // Check if this specific macro is executing
  const isThisMacroExecuting = executingMacroId === macro.id;

  const handleOnPress = useCallback(() => {
    handleMacroPress(macro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExecute = useCallback(() => {
    executeMacro(macro);
  }, [executeMacro, macro]);

  return (
    <Pressable
      onPress={handleExecute}
      key={index}
      style={({ pressed }) => [
        tailwind.style(index === 0 && !isInsideBottomSheet ? 'rounded-t-[13px]' : ''),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row items-center pl-1')}>
        <Animated.View style={tailwind.style('w-[20px] h-[20px] flex items-center justify-center')}>
          {isThisMacroExecuting ? <Spinner size={16} /> : <Icon icon={<MacroIcon />} size={20} />}
        </Animated.View>

        <Animated.View
          style={tailwind.style(
            'flex-1 ml-3 flex-row items-center justify-between py-[11px]',
            !isLastItem ? ' border-b-[1px] border-b-blackA-A3' : '',
          )}>
          <Animated.View>
            <Animated.Text
              style={tailwind.style('font-inter-420-20 leading-[22px] tracking-[0.16px] ')}>
              {macro.name}
            </Animated.Text>
          </Animated.View>
          <Pressable
            onPress={handleOnPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={tailwind.style('flex flex-row items-center pr-3')}>
            {macro.hasChevron ? (
              <Icon icon={<CaretRight />} size={20} />
            ) : (
              <Icon icon={<InfoIcon />} size={22} />
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
export default MacroItem;
