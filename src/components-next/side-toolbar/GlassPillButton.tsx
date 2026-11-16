import { useTailwind } from '@/theme/useTailwind';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { SIZE } from './GlassCircleButton';

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
type GlassPillButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  count?: number;
};

export const GlassPillButton = ({
  label,
  onPress,
  disabled,
  isLoading,
  count,
}: GlassPillButtonProps) => {
  const tailwind = useTailwind();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: isLoading }}
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
          isLoading ? 'opacity-0' : '',
        )}>
        {label}
      </Text>
      {isLoading ? (
        <ActivityIndicator
          color={tailwind.color('text-gray-700')}
          style={tailwind.style('absolute inset-0')}
        />
      ) : null}
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
