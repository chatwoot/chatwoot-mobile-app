import { useEffect, useMemo, useState } from 'react';
import { Image as RNImage } from 'react-native';
import { useCloudflareMedia } from './useCloudflareMedia';

export type ImageCellProps = {
  imageSrc: string;
};

export type ImageContainerProps = Pick<ImageCellProps, 'imageSrc'> & {
  maxWidth?: number;
  maxHeight?: number;
};

const imageDimensionsCache = new Map<string, { width: number; height: number }>();

export const useImageDimensions = (imageSrc: string, maxWidth = 300, maxHeight = 360) => {
  const { uri } = useCloudflareMedia(imageSrc);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;
    if (!uri) {
      setImageDimensions(null);
      return;
    }
    const cachedImageDimensions = imageDimensionsCache.get(uri);

    if (cachedImageDimensions) {
      setImageDimensions(cachedImageDimensions);
      return () => {
        isMounted = false;
      };
    }

    RNImage.getSize(
      uri,
      (width, height) => {
        if (!isMounted || width <= 0 || height <= 0) {
          return;
        }
        const dimensions = { width, height };
        imageDimensionsCache.set(uri, dimensions);
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
  }, [uri]);

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

  return imageStyle;
};
