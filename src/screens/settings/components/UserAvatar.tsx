import React, { useMemo, useState } from 'react';
import { ImageSourcePropType, Text, View, ViewProps } from 'react-native';
import { Image } from 'expo-image';
import { AvailabilityStatus } from '@/types/common/AvailabilityStatus';

import { tailwind } from '@/theme';
import { useThemedStyles } from '@/hooks';
import { cx, styleAdapter } from '@/utils';
import { userStatusList } from '@/constants';

function getInitials(name: string) {
  if (!name) {
    return;
  }
  const [firstName, lastName] = name.split(' ');

  const initials =
    firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`
      : `${firstName.charAt(0)}${firstName.charAt(1)}`;

  return initials.toUpperCase();
}

const getBgColorBasedOnStatus = (status: AvailabilityStatus) => {
  return userStatusList.find(value => value.status === status)?.statusColor || '';
};

const AvatarStatus = ({
  status,
  parentsBackground,
}: {
  status: AvailabilityStatus;
  parentsBackground: string;
}) => {
  const bgColor = getBgColorBasedOnStatus(status);
  return (
    <View
      style={[
        tailwind.style(
          'absolute border-[1.5px] border-white bg-white rounded-full bottom-[2px] right-[2px]',
        ),
        { borderColor: tailwind.color(parentsBackground) },
      ]}
    >
      <View style={tailwind.style(cx('rounded-full h-4 w-4', bgColor))} />
    </View>
  );
};

const AvatarImage = ({
  src,
  handleFallback,
}: {
  src: ImageSourcePropType;
  handleFallback: () => void;
}) => {
  return (
    <Image source={src} style={tailwind.style('rounded-full h-24 w-24')} onError={handleFallback} />
  );
};

export interface UserAvatarProps extends ViewProps {
  /**
   * The image source (either a remote URL or a local file resource).
   * Check https://reactnative.dev/docs/image#imagesource
   */
  src?: string | ImageSourcePropType;
  /**
   * Name prop used for `alt` & calculate placeholder initials.
   */
  name: string;
  /**
   * Shows AvatarBadge with the given type
   *
   * @default none
   */
  status?: AvailabilityStatus;
  /**
   * StatusIndicator's Background Color & StatusIndicator Ring Color.
   *
   * @default "text-white"
   */
  parentsBackground: string;
}

export const UserAvatar: React.FC<Partial<UserAvatarProps>> = props => {
  const { name, src, status, parentsBackground = 'text-white', style, ...boxProps } = props;
  const themedTailwind = useThemedStyles();

  const isSourceAvailable = useMemo(() => (src ? true : false), [src]);
  const [imageAvailable, setImageAvailable] = useState(isSourceAvailable);
  const loadFallback = () => setImageAvailable(false);

  return (
    <View
      style={[
        themedTailwind.style(
          'relative items-center justify-center bg-gray-100 rounded-full h-24 w-24',
        ),
        styleAdapter(style),
      ]}
      {...boxProps}
    >
      {imageAvailable && src ? (
        <AvatarImage src={src} handleFallback={loadFallback} />
      ) : name ? (
        <Text
          style={[
            themedTailwind.style(
              'text-center uppercase text-gray-800 font-inter-medium-24 text-3xl',
            ),
          ]}
          adjustsFontSizeToFit
          allowFontScaling={false}
        >
          {getInitials(name)}
        </Text>
      ) : null}
      {status && <AvatarStatus parentsBackground={parentsBackground} status={status} />}
    </View>
  );
};
