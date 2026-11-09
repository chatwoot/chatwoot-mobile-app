import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { Icon } from '@/components-next/common/icon';
import { tailwind } from '@/theme';

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
const SIZE = 36;

type GlassCircleButtonProps = {
  icon: React.ReactElement;
  // Leave out when the button is a menu trigger, so the menu receives the tap.
  onPress?: () => void;
  accessibilityLabel: string;
  showBadge?: boolean;
  iconSize?: number;
  disabled?: boolean;
};

export const HEADER_ICON_COLOR = '#171717';

export const GlassCircleButton = ({
  icon,
  onPress,
  accessibilityLabel,
  showBadge,
  iconSize = 20,
  disabled = false,
}: GlassCircleButtonProps) => {
  const Container = onPress ? Pressable : View;
  const content = (
    <View>
      {showBadge && (
        <View
          style={tailwind.style('absolute z-10 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-800')}
        />
      )}
      <Icon size={iconSize} icon={icon} />
    </View>
  );
  return (
    <Container
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={tailwind.style(
        `h-[${SIZE}px] w-[${SIZE}px] items-center justify-center`,
        disabled ? 'opacity-40' : '',
      )}>
      {useLiquidGlass ? (
        <GlassView
          glassEffectStyle="regular"
          isInteractive={!disabled}
          style={[tailwind.style('absolute inset-0'), { borderRadius: SIZE / 2 }]}
        />
      ) : (
        <View style={tailwind.style('absolute inset-0 rounded-full bg-gray-100')} />
      )}
      {content}
    </Container>
  );
};

type GlassPillButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  count?: number;
};

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
