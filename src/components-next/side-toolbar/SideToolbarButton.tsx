import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { Icon } from '@/components-next/common/icon';
import { useSideTabBarLayout } from '@/utils';

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

type SideToolbarButtonProps = {
  icon: React.ReactElement;
  // Leave out when the button is a menu trigger, so the menu receives the tap.
  onPress?: () => void;
  accessibilityLabel: string;
  // Shows a small dot, e.g. when filters are applied.
  showBadge?: boolean;
  // Optical size: symbols with a lot of empty space (✕, …) need a larger box to look as
  // big as round ones.
  iconSize?: number;
  disabled?: boolean;
};

// A round Liquid Glass button for the side toolbar used when tabs sit on the side (iPhone
// Duo). Each action is its own circle, so the toolbar doesn't read as a second tab bar.
// As wide as the tab capsule, and larger when the Duo is closed.
export const SideToolbarButton = ({
  icon,
  onPress,
  accessibilityLabel,
  showBadge,
  iconSize = 24,
  disabled,
}: SideToolbarButtonProps) => {
  const tailwind = useTailwind();
  const sideTabBar = useSideTabBarLayout();
  const size = sideTabBar?.width ?? 40;
  const drawnIconSize = Math.round(iconSize * (sideTabBar?.iconScale ?? 1));
  const circle = { width: size, height: size, borderRadius: size / 2 };

  const background = useLiquidGlass ? (
    <GlassView
      glassEffectStyle="regular"
      isInteractive={!!onPress && !disabled}
      style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
    />
  ) : (
    <View
      style={[
        StyleSheet.absoluteFill,
        tailwind.style('bg-white border border-blackA-A3'),
        { borderRadius: size / 2 },
      ]}
    />
  );
  const content = (
    <View>
      {showBadge && (
        <View
          style={tailwind.style('absolute z-10 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-800')}
        />
      )}
      <Icon size={drawnIconSize} icon={icon} />
    </View>
  );

  if (!onPress) {
    return (
      <View
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[tailwind.style('items-center justify-center'), circle]}>
        {background}
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        tailwind.style('items-center justify-center'),
        circle,
        // Glass shows its own press response; the fallback dims.
        !useLiquidGlass && pressed ? tailwind.style('opacity-70') : null,
      ]}>
      {background}
      {content}
    </Pressable>
  );
};
