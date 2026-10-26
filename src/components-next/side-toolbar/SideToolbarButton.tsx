import React from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components-next/common/icon';
import { tailwind } from '@/theme';

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

// A round button for the side toolbar used when tabs sit on the side (iPhone Duo).
export const SideToolbarButton = ({
  icon,
  onPress,
  accessibilityLabel,
  showBadge,
  iconSize = 24,
  disabled,
}: SideToolbarButtonProps) => {
  if (!onPress) {
    return (
      <View
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={tailwind.style('h-[34px] w-[34px] rounded-full items-center justify-center')}>
        <View>
          {showBadge && (
            <View
              style={tailwind.style(
                'absolute z-10 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-800',
              )}
            />
          )}
          <Icon size={iconSize} icon={icon} />
        </View>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      // 34pt circle; a margin keeps the tap area comfortable.
      hitSlop={{ top: 4, left: 6, right: 6, bottom: 4 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) =>
        tailwind.style(
          'h-[34px] w-[34px] rounded-full items-center justify-center',
          pressed ? 'bg-blackA-A3' : 'bg-transparent',
        )
      }>
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
};
