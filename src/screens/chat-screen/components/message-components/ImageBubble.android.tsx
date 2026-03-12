import React from 'react';
import ImageModal from 'react-native-image-modal';
import { tailwind } from '@/theme';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import type { ImageCellProps, ImageContainerProps } from '@/hooks/useImageDimensions';

export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const { imageSrc, maxWidth = 300, maxHeight = 360 } = props;
  const imageStyle = useImageDimensions(imageSrc, maxWidth, maxHeight);

  return (
    <ImageModal
      source={{ uri: imageSrc }}
      resizeMode="contain"
      modalImageResizeMode="contain"
      overlayBackgroundColor="#000000"
      imageBackgroundColor="#F3F4F6"
      isTranslucent
      style={[tailwind.style('bg-gray-100 overflow-hidden'), imageStyle]}
    />
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
