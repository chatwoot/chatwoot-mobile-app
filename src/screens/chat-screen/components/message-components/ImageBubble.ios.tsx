import React from 'react';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';
import { tailwind } from '@/theme';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import type { ImageCellProps, ImageContainerProps } from '@/hooks/useImageDimensions';

export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const { imageSrc, maxWidth = 300, maxHeight = 360 } = props;
  const imageStyle = useImageDimensions(imageSrc, maxWidth, maxHeight);

  return (
    <Galeria urls={[imageSrc]}>
      <Galeria.Image>
        <Image
          source={{ uri: imageSrc }}
          contentFit="contain"
          style={[tailwind.style('bg-gray-100 overflow-hidden'), imageStyle]}
        />
      </Galeria.Image>
    </Galeria>
  );
};

export const ImageBubble = (props: ImageCellProps) => {
  const { imageSrc } = props;

  return (
    <React.Fragment>
      <ImageBubbleContainer {...{ imageSrc }} />
    </React.Fragment>
  );
};
