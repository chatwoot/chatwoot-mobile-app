import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { Icon } from '@/components-next/common/icon';
import { tailwind } from '@/theme';

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
const SIZE = 36;

type GlassCircleButtonProps = {
  icon: React.ReactElement;
  onPress: () => void;
  accessibilityLabel: string;
  // Shows a small dot, e.g. when filters are applied.
  showBadge?: boolean;
  // Icons drawn edge to edge (like the selection circles) read larger, so they use 18.
  iconSize?: number;
};

// One color for every header button icon, matching the tab bar icons.
export const HEADER_ICON_COLOR = '#171717';

// Round header button in the system Liquid Glass style (like WhatsApp's header
// buttons on iPhone Duo). Falls back to a light gray circle where glass isn't available.
export const GlassCircleButton = ({
  icon,
  onPress,
  accessibilityLabel,
  showBadge,
  iconSize = 20,
}: GlassCircleButtonProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={tailwind.style(`h-[${SIZE}px] w-[${SIZE}px] items-center justify-center`)}>
    {useLiquidGlass ? (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        style={[tailwind.style('absolute inset-0'), { borderRadius: SIZE / 2 }]}
      />
    ) : (
      <View style={tailwind.style('absolute inset-0 rounded-full bg-gray-100')} />
    )}
    <View>
      {showBadge && (
        <View
          style={tailwind.style('absolute z-10 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-800')}
        />
      )}
      <Icon size={iconSize} icon={icon} />
    </View>
  </Pressable>
);

type GlassPillButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  // Shown after the label in a small round count badge, e.g. applied filters.
  count?: number;
};

// Text action in the same glass style as GlassCircleButton, e.g. "Clear" in the header.
export const GlassPillButton = ({ label, onPress, disabled, count }: GlassPillButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    style={tailwind.style(`h-[${SIZE}px] px-3.5 flex-row items-center justify-center gap-1.5`)}>
    {useLiquidGlass ? (
      <GlassView
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
        <Text style={tailwind.style('text-[12px] leading-[16px] font-inter-medium-24 text-white')}>
          {count}
        </Text>
      </View>
    ) : null}
  </Pressable>
);
