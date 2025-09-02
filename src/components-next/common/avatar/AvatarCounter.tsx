import React from 'react';
import { Text, View } from 'react-native';

import { avatarTheme, tailwind } from '@/theme';
import { cx } from '@/utils';

import { AvatarProps, AvatarSizes } from './Avatar';

export interface AvatarCounterProps extends Pick<AvatarProps, 'size' | 'parentsBackground'> {
  /**
   * The count number to display in the badge
   */
  count: number;
  /**
   * Maximum count to display before showing "99+"
   * @default 99
   */
  maxCount?: number;
}

export const AvatarCounter: React.FC<AvatarCounterProps> = ({
  count,
  maxCount = 99,
  size = 'xl',
  parentsBackground = 'text-white',
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const isLargeCount = displayCount.length > 1;

  return (
    <View
      style={[
        tailwind.style(cx(avatarTheme.counter.container)),
        {
          bottom: avatarTheme.counter.position[size],
          right: avatarTheme.counter.position[size],
          borderColor: tailwind.color(parentsBackground),
          minWidth: avatarTheme.counter.size[size].minWidth,
          height: avatarTheme.counter.size[size].height,
          paddingHorizontal: isLargeCount 
            ? avatarTheme.counter.padding[size].horizontal 
            : 0,
        },
      ]}>
      <Text
        style={tailwind.style(
          cx(
            avatarTheme.counter.text.base,
            avatarTheme.counter.text.size[size],
          ),
        )}
        adjustsFontSizeToFit
        allowFontScaling={false}>
        {displayCount}
      </Text>
    </View>
  );
};
