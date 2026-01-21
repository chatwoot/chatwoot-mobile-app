import React, { useState, useEffect } from 'react';
import { Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';
import { tailwind } from '@/theme';

type ImageBubbleProps = {
  imageSrc: string;
  width?: number;
};

export const ImageBubble = (props: ImageBubbleProps) => {
  const { imageSrc, width: imageWidth} = props;
  const [imageSize, setImageSize] = useState({ width: 300, height: 215 }); // Default or placeholder size

  useEffect(() => {
    RNImage.getSize(
      imageSrc,
      (width, height) => {
        const maxWidth = imageWidth || 300;
        const aspectRatio = width / height;
        const calculatedHeight = maxWidth / aspectRatio;

        setImageSize({ width: maxWidth, height: calculatedHeight });
      },
      error => {
        console.error(`Couldn't get image size: ${error.message}`);
      },
    );
  }, [imageSrc]);

  return (
    <Galeria urls={[imageSrc]}>
      <Galeria.Image>
        <Image
          source={{ uri: imageSrc }}
          contentFit="contain"
          style={[
            tailwind.style('h-full w-full bg-gray-100 overflow-hidden rounded-lg'),
            { width: imageSize.width, height: imageSize.height },
          ]}
        />
      </Galeria.Image>
    </Galeria>
  );
};
