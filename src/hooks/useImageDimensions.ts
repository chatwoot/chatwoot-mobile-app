import { useEffect, useMemo, useState } from 'react';
import { Image as RNImage } from 'react-native';

export type ImageCellProps = {
  imageSrc: string;
  sourceWidth?: number | null;
  sourceHeight?: number | null;
};

export type ImageContainerProps = Pick<ImageCellProps, 'imageSrc'> & {
  maxWidth?: number;
  maxHeight?: number;
  sourceWidth?: number | null;
  sourceHeight?: number | null;
};

const imageDimensionsCache = new Map<string, { width: number; height: number }>();

const isValidImageDimension = (dimension?: number | null) => {
  return typeof dimension === 'number' && Number.isFinite(dimension) && dimension > 0;
};

export const useImageDimensions = (
  imageSrc: string,
  maxWidth = 300,
  maxHeight = 360,
  sourceDimensions?: { width?: number | null; height?: number | null },
) => {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;
    const sourceWidth = sourceDimensions?.width;
    const sourceHeight = sourceDimensions?.height;
    const hasSourceDimensions =
      isValidImageDimension(sourceWidth) && isValidImageDimension(sourceHeight);

    if (hasSourceDimensions) {
      const dimensions = {
        width: sourceWidth as number,
        height: sourceHeight as number,
      };
      imageDimensionsCache.set(imageSrc, dimensions);
      setImageDimensions(dimensions);
      return () => {
        isMounted = false;
      };
    }

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
  }, [imageSrc, sourceDimensions?.height, sourceDimensions?.width]);

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
