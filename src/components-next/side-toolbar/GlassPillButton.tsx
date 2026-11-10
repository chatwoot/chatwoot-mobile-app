import { useTailwind } from '@/theme/useTailwind';
import { Platform, Pressable, Text, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { SIZE } from './GlassCircleButton';

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
type GlassPillButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  count?: number;
};

export const GlassPillButton = ({ label, onPress, disabled, count }: GlassPillButtonProps) => {
  const tailwind = useTailwind();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={tailwind.style(`h-[${SIZE}px] px-3.5 flex-row items-center justify-center gap-1.5`)}>
      {useLiquidGlass ? (
        <GlassView
          colorScheme={tailwind.isDark ? 'dark' : 'light'}
          glassEffectStyle="regular"
          isInteractive={!disabled}
          style={[tailwind.style('absolute inset-0'), { borderRadius: SIZE / 2 }]}
        />
      ) : (
        <View style={tailwind.style('absolute inset-0 rounded-full bg-gray-100')} />
      )}
      <Text
        style={tailwind.style(
          'text-[15px] leading-[20px] font-inter-medium-24',
          disabled ? 'text-gray-700' : 'text-blue-800',
        )}>
        {label}
      </Text>
      {count ? (
        <View
          style={tailwind.style(
            'h-5 min-w-[20px] px-1 rounded-full bg-blue-800 items-center justify-center',
          )}>
          <Text
            style={tailwind.style('text-[12px] leading-[16px] font-inter-medium-24 text-white')}>
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};
