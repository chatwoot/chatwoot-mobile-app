import { useTailwind } from '@/theme/useTailwind';
import React, { useEffect } from 'react';
import { Image } from 'expo-image';

import { avatarTheme } from '@/theme';
import { cx } from '@/utils';

import { AvatarProps } from './Avatar';
import { useCloudflareMedia } from '@/hooks/useCloudflareMedia';

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
  const tailwind = useTailwind();
  const remoteUri = typeof src === 'object' && 'uri' in src ? src.uri : undefined;
  const media = useCloudflareMedia(remoteUri);
  const onError = () => {
    handleFallback();
  };

  useEffect(() => {
    if (media.failed) {
      handleFallback();
    }
  }, [media.failed, handleFallback]);

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
      source={remoteUri ? (media.uri ? { uri: media.uri } : null) : src}
      style={[
        avatarTheme.borderRadius.size[size],
        tailwind.style(cx(avatarTheme.image, !squared ? avatarTheme.circular : '')),
      ]}
      onError={onError}
      {...imageProps}
    />
  );
};
