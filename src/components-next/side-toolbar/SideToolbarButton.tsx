import React from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components-next/common/icon';
import { tailwind } from '@/theme';

type SideToolbarButtonProps = {
  icon: React.ReactElement;
  onPress: () => void;
  accessibilityLabel: string;
  // Shows a small dot, e.g. when filters are applied.
  showBadge?: boolean;
  disabled?: boolean;
};

// A round button for the side toolbar used when tabs sit on the side (iPhone Duo).
export const SideToolbarButton = ({
  icon,
  onPress,
  accessibilityLabel,
  showBadge,
  disabled,
}: SideToolbarButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) =>
      tailwind.style(
        'h-11 w-11 rounded-full items-center justify-center',
        pressed ? 'bg-blackA-A3' : 'bg-transparent',
      )
    }>
    <View>
      {showBadge && (
        <View
          style={tailwind.style('absolute z-10 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-800')}
        />
      )}
      <Icon size={24} icon={icon} />
    </View>
  </Pressable>
);
