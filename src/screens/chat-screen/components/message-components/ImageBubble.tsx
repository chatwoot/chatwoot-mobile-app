import React, { useEffect, useMemo, useState } from 'react';
import { Image as RNImage } from 'react-native';
import ImageModal from 'react-native-image-modal';
import { tailwind } from '@/theme';

type ImageCellProps = {
  imageSrc: string;
};

type ImageContainerProps = Pick<ImageCellProps, 'imageSrc'> & {
  maxWidth?: number;
  maxHeight?: number;
};

const imageDimensionsCache = new Map<string, { width: number; height: number }>();

/**
 * Renders a chat image preview and fullscreen modal.
 *
 * The preview size is derived from the original image resolution and
 * constrained by maxWidth/maxHeight while preserving aspect ratio.
 */
export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const { imageSrc, maxWidth = 300, maxHeight = 360 } = props;
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;
    const cachedImageDimensions = imageDimensionsCache.get(imageSrc);

    if (cachedImageDimensions) {
      setImageDimensions(cachedImageDimensions);
      return () => {
        isMounted = false;
      };
    }

    RNImage.getSize(
      imageSrc,
      (width, height) => {
        if (!isMounted || width <= 0 || height <= 0) {
          return;
        }
        const dimensions = { width, height };
        imageDimensionsCache.set(imageSrc, dimensions);
        setImageDimensions(dimensions);
      },
      () => {
        if (!isMounted) {
          return;
        }
        setImageDimensions(null);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [imageSrc]);

  const imageStyle = useMemo(() => {
    const fallbackHeight = Math.round(maxWidth * 0.75);
    if (!imageDimensions) {
      return { width: maxWidth, height: fallbackHeight };
    }
    const imageRatio = imageDimensions.width / imageDimensions.height;
    let width = Math.min(maxWidth, imageDimensions.width);
    let height = Math.round(width / imageRatio);

    if (height > maxHeight) {
      const scale = maxHeight / height;
      width = Math.round(width * scale);
      height = maxHeight;
    }

    return { width, height };
  }, [imageDimensions, maxHeight, maxWidth]);

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
