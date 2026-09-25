import React from 'react';
import {
  Platform,
  View,
  type ColorValue,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

// Liquid Glass ships with iOS 26; older iOS and Android get the solid fallback style
export const hasLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

type GlassSurfaceProps = ViewProps & {
  tint?: ColorValue;
  interactive?: boolean;
  fallbackStyle?: StyleProp<ViewStyle>;
};

export const GlassSurface = ({
  tint,
  interactive,
  fallbackStyle,
  style,
  children,
  ...rest
}: GlassSurfaceProps) =>
  hasLiquidGlass ? (
    <GlassView
      glassEffectStyle="regular"
      tintColor={tint}
      isInteractive={interactive}
      style={style}
      {...rest}>
      {children}
    </GlassView>
  ) : (
    <View style={[style, fallbackStyle]} {...rest}>
      {children}
    </View>
  );
