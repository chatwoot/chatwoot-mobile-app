import React, { useState } from 'react';
import {
  ImageProps,
  ImageSourcePropType,
  ImageURISource,
  Text,
  View,
  ViewProps,
} from 'react-native';

import { avatarTheme, tailwind } from '@/theme';
import { Channel } from '@/types';
import { cx, styleAdapter } from '@/utils';
import { useTheme } from '@/context/ThemeContext';

import { AvatarImage } from './AvatarImage';
import { AvatarStatus } from './AvatarStatus';

export type AvatarSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type AvatarStatusType = 'online' | 'away' | 'offline' | 'typing';

export const removeEmoji = (text: string) => {
  if (text) {
    return text
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        '',
      )
      .replace(/\s+/g, ' ')
      .trim();
  }
  return '';
};

function getInitials(name: string, size: AvatarSizes) {
  const userNameWithoutEmoji = removeEmoji(name).trimStart();
  if (!userNameWithoutEmoji) {
    return;
  }
  const [firstName, lastName] = userNameWithoutEmoji.split(' ');
  const oneLetterInitialSizes = ['xs', 'sm', 'md'];
  const initials =
    firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`
      : `${firstName.charAt(0)}${firstName.charAt(1)}`;

  return oneLetterInitialSizes.includes(size)
    ? initials.toUpperCase().charAt(0)
    : initials.toUpperCase();
}

export interface AvatarProps extends ViewProps {
  /**
   * React Native Image component Props, except for source
   */
  imageProps: Omit<ImageProps, 'source'>;
  /**
   * The image source (either a remote URL or a local file resource).
   * Check https://reactnative.dev/docs/image#imagesource
   */
  src: ImageSourcePropType;
  /**
   * How large should avatar be?
   *
   * @default xl
   */
  size: AvatarSizes;
  /**
   * If `true`, Avatar looks like a squared.
   *
   * @default false
   */
  squared: boolean;
  /**
   * Name prop used for `alt` & calculate placeholder initials.
   */
  name: string;
  /**
   * Shows AvatarBadge with the given type
   *
   * @default none
   */
  status: AvatarStatusType;
  /**
   * StatusIndicator's Background Color & StatusIndicator Ring Color.
   *
   * @default "text-white"
   */
  parentsBackground: string;
  /**
   * The Avatar Channel Indicator, more likely for
   */
  channel: Channel;
}

export const Avatar: React.FC<Partial<AvatarProps>> = props => {
  const {
    size: rawSize = 'xl',
    squared = false,
    name,
    src,
    status,
    parentsBackground = 'text-white',
    imageProps = {},
    channel,
    style,
    ...boxProps
  } = props;

  // Defensive check: ensure size is valid, fallback to 'xl' if invalid
  const validSizes: AvatarSizes[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
  const size = validSizes.includes(rawSize as AvatarSizes) ? (rawSize as AvatarSizes) : 'xl';

  const isSquared = squared;
  const isSourceAvailable = !!src;
  const { colors } = useTheme();

  const [imageAvailable, setImageAvailable] = useState(isSourceAvailable);
  const loadFallback = () => setImageAvailable(false);

  return (
    <View
      style={[
        avatarTheme.borderRadius.size[size],
        tailwind.style(
          cx(avatarTheme.size[size], !isSquared ? avatarTheme.circular : '', 'relative items-center justify-center'),
        ),
        { backgroundColor: colors.backgroundSecondary },
        styleAdapter(style),
      ]}
      {...boxProps}>
      {imageAvailable && src ? (
        <AvatarImage
          size={size}
          imageProps={imageProps}
          src={src as ImageURISource}
          squared={isSquared}
          handleFallback={loadFallback}
        />
      ) : name ? (
        <Text
          style={[
            tailwind.style(
              cx(
                avatarTheme.initials.size[size],
                'font-inter-medium-24 text-center uppercase',
              ),
            ),
            { color: colors.text },
          ]}
          adjustsFontSizeToFit
          allowFontScaling={false}>
          {getInitials(name, size)}
        </Text>
      ) : null}
      {status && <AvatarStatus parentsBackground={parentsBackground} size={size} status={status} />}
    </View>
  );
};
