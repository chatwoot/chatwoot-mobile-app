import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';
import { tailwind } from '@/theme';

/**
 * ImageBubble component for displaying images in chat messages.
 * Automatically calculates aspect ratio from backend dimensions or detects on load,
 * respecting max width constraints while maintaining proper image proportions.
 */

type ImageCellProps = {
  imageSrc: string;
  imageWidth?: number; 
  imageHeight?: number;
};

type ImageContainerProps = ImageCellProps & {
  displayMaxWidth?: number;
};

export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const { 
    imageSrc, 
    imageWidth, 
    imageHeight, 
    displayMaxWidth = 300 
  } = props;

  const [detectedSize, setDetectedSize] = useState<{width: number, height: number} | null>(null);

  const actualWidth = imageWidth ?? detectedSize?.width;
  const actualHeight = imageHeight ?? detectedSize?.height;

  const renderWidth = actualWidth 
    ? Math.min(actualWidth, displayMaxWidth) 
    : displayMaxWidth;

  const aspectRatio = (actualWidth && actualHeight) 
    ? (actualWidth / actualHeight) 
    : 1;

  return (
    <Galeria urls={[imageSrc]}>
      <Galeria.Image>
        <Image
          source={{ uri: imageSrc }}
          contentFit="cover"
          onLoad={(e) => {
            if (!imageWidth || !imageHeight) {
              setDetectedSize({
                width: e.source.width,
                height: e.source.height,
              });
            }
          }}
          style={[
            tailwind.style('bg-gray-200 overflow-hidden rounded-lg'),
            { 
              width: renderWidth,         
              aspectRatio: aspectRatio,   
            },
          ]}
        />
      </Galeria.Image>
    </Galeria>
  );
};

export const ImageBubble = (props: ImageCellProps) => {
  return <ImageBubbleContainer {...props} />;
};