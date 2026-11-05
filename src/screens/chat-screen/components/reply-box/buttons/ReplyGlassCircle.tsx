import { useTailwind } from '@/theme/useTailwind';
import React, { PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

// 36pt round Liquid Glass background for the iPhone Duo reply bar's left buttons, like
// the + button in Messages. Falls back to a light gray circle where glass isn't available.
export const ReplyGlassCircle = ({ children }: PropsWithChildren) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style('h-9 w-9 items-center justify-center')}>
      {useLiquidGlass ? (
        <GlassView
          glassEffectStyle="regular"
          isInteractive
          style={[tailwind.style('absolute inset-0'), { borderRadius: 18 }]}
        />
      ) : (
        <View style={tailwind.style('absolute inset-0 rounded-full bg-gray-100')} />
      )}
      {children}
    </View>
  );
};
