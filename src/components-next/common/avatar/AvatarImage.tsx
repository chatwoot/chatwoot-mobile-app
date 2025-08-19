import React, { useEffect } from 'react';
import { Image } from 'expo-image';

import { avatarTheme, tailwind } from '@/theme';
import { cx } from '@/utils';

import { AvatarProps } from './Avatar';

interface AvatarImageProps extends Pick<AvatarProps, 'imageProps' | 'src' | 'squared' | 'size'> {
  handleFallback: () => void;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  imageProps,
  src,
  squared,
  size,
  handleFallback,
}) => {
  const onError = () => {
    handleFallback();
  };

  useEffect(() => {
    if (
      typeof src === 'object' &&
      'uri' in src && // Check if it's a remote image source
      !src.uri // Check if URI is empty
    ) {
      onError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <Image
      source={src}
      style={[
        avatarTheme.borderRadius.size[size],
        tailwind.style(cx(avatarTheme.image, !squared ? avatarTheme.circular : '')),
      ]}
      // Seems to be tricky to set the right type here, but as we are not
      // doing anything with the error data, we can ignore the TS here
      // @ts-expect-error Image onError expects ImageErrorEventData but we only need the callback
      onError={onError}
      {...imageProps}
    />
  );
};
