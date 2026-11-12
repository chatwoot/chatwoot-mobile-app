import { useTailwind } from '@/theme/useTailwind';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Macro } from '@/types';

import { useMacroSteps } from './useMacroSteps';
import { CARD, ROW_DIVIDER } from './macroStyles';

export const MacroSteps = ({ macro, conversationId }: { macro: Macro; conversationId: number }) => {
  const tailwind = useTailwind();
  const steps = useMacroSteps(macro, conversationId);
  return (
    <Animated.View entering={FadeIn.duration(200)} style={tailwind.style(CARD)}>
      {steps.map((step, index) => (
        <View key={index} style={tailwind.style('pl-4')}>
          <View style={tailwind.style('py-[11px] pr-4', index < steps.length - 1 && ROW_DIVIDER)}>
            <Text
              style={tailwind.style(
                'text-[17px] leading-[22px] font-inter-normal-20 text-gray-950',
              )}>
              {step.name}
            </Text>
            {step.value ? (
              <Text
                style={tailwind.style(
                  'pt-0.5 text-[15px] leading-[20px] font-inter-normal-20 text-gray-700',
                )}>
                {step.value}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </Animated.View>
  );
};
