import React from 'react';
import { View } from 'react-native';

import { avatarTheme, tailwind } from '../../../theme';
import { cx, getChannelTypeIcon } from '../../../utils';
import { Icon } from '../icon';

import { AvatarProps } from './Avatar';

export const AvatarChannel: React.FC<
  Pick<AvatarProps, 'size' | 'channel' | 'parentsBackground'>
> = props => {
  const { size, channel, parentsBackground } = props;

  return (
    <View
      style={[
        tailwind.style(cx(avatarTheme.status.icon.container)),
        avatarTheme.status.position,
        {
          borderColor: tailwind.color(parentsBackground),
          backgroundColor: tailwind.color(parentsBackground),
        },
      ]}>
      <Icon size={avatarTheme.status.icon.size[size]} icon={getChannelTypeIcon(channel)} />
    </View>
  );
};
