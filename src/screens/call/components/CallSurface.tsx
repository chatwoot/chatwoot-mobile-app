import React, { PropsWithChildren } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { useTailwind } from '@/theme/useTailwind';

import { useCallTheme } from '../constants/callTheme';

export const CALL_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

type CallSurfaceProps = PropsWithChildren<{
  radius: number;
  shadow: ViewStyle;
  interactive?: boolean;
  plain?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export const CallSurface = ({
  radius,
  shadow,
  interactive = false,
  plain = false,
  style,
  children,
}: CallSurfaceProps) => {
  const tailwind = useTailwind();
  const { CALL_SURFACE } = useCallTheme();
  if (plain) return <View style={style}>{children}</View>;
  if (!CALL_GLASS) {
    return (
      <View style={[{ borderRadius: radius, backgroundColor: CALL_SURFACE }, shadow, style]}>
        {children}
      </View>
    );
  }
  return (
    <View style={[{ borderRadius: radius }, style]}>
      <GlassView
        glassEffectStyle="regular"
        colorScheme={tailwind.isDark ? 'dark' : 'light'}
        isInteractive={interactive}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      {children}
    </View>
  );
};
