import React from 'react';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';
import { tailwind } from '@/theme';

type ImageCellProps = {
  imageSrc: string;
};

type ImageContainerProps = Pick<ImageCellProps, 'imageSrc'> & {
  width?: number;
  height?: number;
};

export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const { imageSrc, height = 300, width = 215 } = props;

  return (
    <Galeria urls={[imageSrc]}>
      <Galeria.Image>
        <Image
          source={{ uri: imageSrc }}
          contentFit="cover"
          style={[
            tailwind.style('h-full w-full bg-gray-100 overflow-hidden'),
            { width: width, height: height },
          ]}
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
