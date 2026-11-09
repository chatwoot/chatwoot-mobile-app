import { Platform, Pressable, StyleSheet } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useSlaPillVisibility } from '../../SlaPillVisibility';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Icon } from '@/components-next';
import { SLAIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

export const FloatingSlaPill = ({
  label,
  isMissed,
  onPress,
}: {
  label: string;
  isMissed: boolean;
  onPress: () => void;
}) => {
  const visibility = useSlaPillVisibility();
  const style = useAnimatedStyle(() => {
    const shown = visibility ? visibility.value : 1;
    return { opacity: shown, transform: [{ translateY: (1 - shown) * -12 }] };
  });
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[tailwind.style('absolute left-0 right-0 top-full mt-2 items-center'), style]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) =>
          tailwind.style(
            'flex-row items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-full',
            useLiquidGlass ? '' : 'bg-white border-[0.5px] border-blackA-A6',
            pressed && 'opacity-70',
          )
        }>
        {useLiquidGlass ? (
          <GlassView
            glassEffectStyle="regular"
            isInteractive
            style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          />
        ) : null}
        <Icon icon={<SLAIcon color={isMissed ? '#E13D45' : '#858585'} />} size={14} />
        <Animated.Text
          style={tailwind.style(
            'text-[13px] leading-[18px] font-inter-medium-24',
            isMissed ? 'text-ruby-800' : 'text-gray-950',
          )}>
          {label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
